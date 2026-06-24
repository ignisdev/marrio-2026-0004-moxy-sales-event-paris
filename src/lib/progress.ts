import type { GalleryProgress } from "@/types/domain";

export function calculateProgress({
  collectedArtworkSlugs,
  required,
  uid,
}: {
  collectedArtworkSlugs: string[];
  required: number;
  uid: string;
}): GalleryProgress {
  const uniqueSlugs = [...new Set(collectedArtworkSlugs)];

  return {
    uid,
    collected: uniqueSlugs.length,
    required,
    isComplete: uniqueSlugs.length >= required,
    collectedArtworkSlugs: uniqueSlugs,
  };
}
