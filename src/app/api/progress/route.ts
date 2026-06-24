import { NextResponse } from "next/server";
import configPromise from "@payload-config";
import { getPayload } from "payload";

import { requiredArtworkCount } from "@/config/constants";
import { calculateProgress } from "@/lib/progress";

export async function GET(request: Request) {
  const uid = new URL(request.url).searchParams.get("uid")?.trim();

  if (!uid) {
    return NextResponse.json({ message: "Missing uid." }, { status: 400 });
  }

  const payload = await getPayload({ config: configPromise });
  const participantResult = await payload.find({
    collection: "participants",
    depth: 1,
    limit: 1,
    where: { uid: { equals: uid } },
  });
  const participant = participantResult.docs[0];

  if (!participant) {
    return NextResponse.json({ message: "Participant not found." }, { status: 404 });
  }

  const event = typeof participant.event === "number" ? null : participant.event;
  const required = event?.totalRequiredArtworks ?? requiredArtworkCount;

  const scanResult = await payload.find({
    collection: "scan-events",
    depth: 1,
    limit: 100,
    where: { participant: { equals: participant.id } },
  });
  const collectedArtworkSlugs = scanResult.docs
    .map((scan) => scan.artwork)
    .map((scanArtwork) => (typeof scanArtwork === "number" ? null : scanArtwork.slug))
    .filter((slug): slug is string => Boolean(slug));

  return NextResponse.json(
    calculateProgress({
      collectedArtworkSlugs,
      required,
      uid: participant.uid,
    }),
  );
}
