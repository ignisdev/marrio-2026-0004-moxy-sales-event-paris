import type { Media } from "@/types/payload-types";

const placeholderImage = "/placeholder-assets/artwork-placeholder.svg";

/**
 * Resolve a Payload upload relationship into a usable image URL.
 *
 * Media relationships may arrive as a numeric id (unpopulated, depth 0) or a
 * populated Media object. Only populated docs carry a `url`. Falls back to null
 * so callers can decide whether to show a placeholder.
 */
export function resolveMediaUrl(
  media: number | Media | null | undefined,
): string | null {
  if (!media || typeof media === "number") {
    return null;
  }

  return media.url || null;
}

/** Resolve a media URL, falling back to the shared artwork placeholder. */
export function resolveMediaUrlOrPlaceholder(
  media: number | Media | null | undefined,
): string {
  return resolveMediaUrl(media) || placeholderImage;
}

export { placeholderImage };
