/**
 * Stable `view-transition-name` for an artwork's image so the gallery thumbnail
 * morphs into the full reveal on the scan page (and back). Sanitised to a valid
 * CSS custom-ident.
 */
export function artworkTransitionName(slug: string): string {
  return `artwork-${slug.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

/** True when the browser supports the View Transitions API. */
export function supportsViewTransitions(): boolean {
  return typeof document !== "undefined" && "startViewTransition" in document;
}
