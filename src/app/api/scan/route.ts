import { NextResponse } from "next/server";
import configPromise from "@payload-config";
import { getPayload } from "payload";
import { track } from "@vercel/analytics/server";

import { calculateProgress } from "@/lib/progress";
import { parseArtworkQrPayload } from "@/lib/qr";
import { scanSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = scanSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }

  const qrPayload = parseArtworkQrPayload(parsed.data.qrPayload);

  if (!qrPayload) {
    return NextResponse.json({ message: "Invalid QR code." }, { status: 400 });
  }

  const payload = await getPayload({ config: configPromise });
  const participantResult = await payload.find({
    collection: "participants",
    depth: 1,
    limit: 1,
    where: {
      uid: {
        equals: parsed.data.uid,
      },
    },
  });
  const participant = participantResult.docs[0];

  if (!participant) {
    return NextResponse.json({ message: "Participant not found." }, { status: 404 });
  }

  const event = typeof participant.event === "number" ? null : participant.event;

  if (!event || event.slug !== qrPayload.eventSlug) {
    return NextResponse.json({ message: "QR code is not valid for this event." }, { status: 400 });
  }

  const artworkResult = await payload.find({
    collection: "artworks",
    limit: 1,
    where: {
      and: [
        {
          event: {
            equals: event.id,
          },
        },
        {
          qrToken: {
            equals: qrPayload.qrToken,
          },
        },
        {
          isActive: {
            equals: true,
          },
        },
        {
          qrIsActive: {
            equals: true,
          },
        },
      ],
    },
  });
  const artwork = artworkResult.docs[0];

  if (!artwork) {
    return NextResponse.json({ message: "Artwork not found." }, { status: 404 });
  }

  const priorScans = await payload.find({
    collection: "scan-events",
    limit: 1,
    where: {
      and: [
        {
          participant: {
            equals: participant.id,
          },
        },
        {
          artwork: {
            equals: artwork.id,
          },
        },
      ],
    },
  });
  const isFirstScanForArtwork = priorScans.totalDocs === 0;

  await payload.create({
    collection: "scan-events",
    data: {
      artwork: artwork.id,
      event: event.id,
      isFirstScanForArtwork,
      locale: parsed.data.locale,
      participant: participant.id,
      scannedAt: new Date().toISOString(),
      source: "qr",
      userAgent: request.headers.get("user-agent") || undefined,
    },
  });

  const scanResult = await payload.find({
    collection: "scan-events",
    depth: 1,
    limit: 100,
    where: {
      participant: {
        equals: participant.id,
      },
    },
  });
  const collectedArtworkSlugs = scanResult.docs
    .map((scan) => scan.artwork)
    .map((scanArtwork) => (typeof scanArtwork === "number" ? null : scanArtwork.slug))
    .filter((slug): slug is string => Boolean(slug));
  const progress = calculateProgress({
    collectedArtworkSlugs,
    required: event.totalRequiredArtworks,
    uid: participant.uid,
  });

  // Fire once: only the first-time scan of a new artwork can newly cross the
  // required count, so this can't double-count on repeat gallery visits.
  if (isFirstScanForArtwork && progress.isComplete) {
    await track(
      "game_completed",
      { eventSlug: event.slug, uid: participant.uid },
      { headers: request.headers },
    );

    const completedAt = new Date().toISOString();

    await payload.update({
      collection: "participants",
      id: participant.id,
      data: { completedAt },
    });

    // Find-or-create so a duplicate/retried request can't double-enter someone.
    const existingRewardEntry = await payload.find({
      collection: "reward-entries",
      limit: 1,
      where: {
        and: [
          { participant: { equals: participant.id } },
          { event: { equals: event.id } },
        ],
      },
    });

    if (existingRewardEntry.totalDocs === 0) {
      await payload.create({
        collection: "reward-entries",
        data: {
          bonvoyRewardEligible: Boolean(participant.isBonvoyMember),
          completedAt,
          event: event.id,
          isComplete: true,
          participant: participant.id,
          prizeDrawEntries: 1,
          standardRewardEligible: true,
        },
      });
    }
  }

  return NextResponse.json({
    artwork: {
      id: artwork.id,
      slug: artwork.slug,
      title: artwork.title,
    },
    isFirstScanForArtwork,
    progress,
  });
}
