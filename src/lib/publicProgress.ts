import configPromise from "@payload-config";
import { getPayload } from "payload";

import { defaultEventSlug, requiredArtworkCount } from "@/config/constants";
import type { Locale } from "@/config/locales";
import { resolveMediaUrl } from "@/lib/media";
export type PublicArtwork = {
  slug: string;
  title: string;
  serverCollected: boolean;
  revealedImageUrl: string | null;
  lockedImageUrl: string | null;
};

export type PublicProgressData = {
  eventTitle: string;
  uid: string;
  displayName: string | null;
  collected: number;
  required: number;
  isComplete: boolean;
  artworks: PublicArtwork[];
};

/**
 * Build the public-safe progress view for a participant uid. Exposes only
 * collected-artwork state — never private participant fields. Returns null when
 * the uid does not resolve to a participant.
 */
export async function getPublicProgress(
  uid: string,
  locale: Locale,
): Promise<PublicProgressData | null> {
  const payload = await getPayload({ config: configPromise });
  const participantResult = await payload.find({
    collection: "participants",
    depth: 1,
    limit: 1,
    where: { uid: { equals: uid } },
  });
  const participant = participantResult.docs[0];

  if (!participant) {
    return null;
  }

  const event = typeof participant.event === "number" ? null : participant.event;
  const required = event?.totalRequiredArtworks ?? requiredArtworkCount;

  const scanResult = await payload.find({
    collection: "scan-events",
    depth: 1,
    limit: 100,
    where: { participant: { equals: participant.id } },
  });
  const collectedSlugs = new Set(
    scanResult.docs
      .map((scan) => scan.artwork)
      .map((artwork) => (typeof artwork === "number" ? null : artwork.slug))
      .filter((slug): slug is string => Boolean(slug)),
  );

  const artworkResult = await payload.find({
    collection: "artworks",
    depth: 1,
    limit: 100,
    locale,
    sort: "displayOrder",
    where: {
      and: [
        { event: { equals: event?.id ?? defaultEventSlug } },
        { isActive: { equals: true } },
      ],
    },
  });

  const artworks: PublicArtwork[] = artworkResult.docs.map((artwork) => ({
    title: artwork.title,
    slug: artwork.slug,
    serverCollected: collectedSlugs.has(artwork.slug),
    revealedImageUrl: resolveMediaUrl(artwork.revealedImage),
    lockedImageUrl: resolveMediaUrl(artwork.lockedImage),
  }));

  const collected = collectedSlugs.size;

  return {
    eventTitle: event?.title ?? "Moxy Hotels - The Art Hunter",
    uid: participant.uid,
    // This is the participant's own shareable card, so the name is shown here.
    displayName: participant.displayName ?? null,
    collected,
    required,
    isComplete: collected >= required,
    artworks,
  };
}
