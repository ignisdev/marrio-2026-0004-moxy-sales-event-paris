import configPromise from "@payload-config";
import { getPayload } from "payload";

import { defaultEventSlug, requiredArtworkCount } from "@/config/constants";
import type { Locale } from "@/config/locales";
import { resolveMediaUrl } from "@/lib/media";
import type { Event } from "@/types/payload-types";

export type GalleryArtwork = {
  slug: string;
  title: string;
  displayOrder: number;
  locationLabel: string | null;
  theme: string | null;
  revealedImageUrl: string | null;
  lockedImageUrl: string | null;
};

export type GalleryData = {
  event: Event | null;
  required: number;
  artworks: GalleryArtwork[];
};

/**
 * Fetch the active event and its active, scannable artworks for the gallery and
 * scan reveal screens. Images are resolved to URLs with depth: 1 so upload
 * relationships are populated.
 */
export async function getGalleryData(locale: Locale): Promise<GalleryData> {
  const payload = await getPayload({ config: configPromise });
  const events = await payload.find({
    collection: "events",
    limit: 1,
    where: { slug: { equals: defaultEventSlug } },
  });
  const event = events.docs[0] ?? null;

  if (!event) {
    return { event: null, required: requiredArtworkCount, artworks: [] };
  }

  const artworkResult = await payload.find({
    collection: "artworks",
    depth: 1,
    limit: 100,
    locale,
    sort: "displayOrder",
    where: {
      and: [
        { event: { equals: event.id } },
        { isActive: { equals: true } },
      ],
    },
  });

  const artworks: GalleryArtwork[] = artworkResult.docs.map((artwork) => ({
    slug: artwork.slug,
    title: artwork.title,
    displayOrder: artwork.displayOrder ?? 0,
    locationLabel: artwork.locationLabel || null,
    theme: artwork.theme || null,
    revealedImageUrl: resolveMediaUrl(artwork.revealedImage),
    lockedImageUrl: resolveMediaUrl(artwork.lockedImage),
  }));

  return {
    event,
    required: event.totalRequiredArtworks ?? requiredArtworkCount,
    artworks,
  };
}
