import type { Field, GlobalConfig } from "payload";

import { COPY_KEYS, DEFAULT_COPY, SITE_COPY_GLOBAL_SLUG } from "../lib/copy.ts";

// Keys whose values span multiple lines (rendered with hard breaks) or hold one
// HeadingBox row per line — these get a textarea so admins can control the line
// breaks per locale.
const MULTILINE_KEYS = new Set<string>([
  "headingArtHunter",
  "headingHowToPlay",
  "headingPixelPerfect",
  "headingRegister",
  "loginHeading",
  "landingIntro",
  "step3",
  "step4",
  "scannerFound",
  "completeGallery",
  "completeClaim",
  "completeVerifyNote",
]);

// Turn a camelCase key into a readable admin label, e.g. galleryScanArtwork ->
// "Gallery scan artwork".
function labelFor(key: string): string {
  const words = key.replace(/([A-Z])/g, " $1").trim();
  return words.charAt(0).toUpperCase() + words.slice(1).toLowerCase();
}

/**
 * Site Copy global — every user-facing string in the guest experience, editable
 * per locale (EN/FR). Defaults mirror `DEFAULT_COPY`; an empty field falls back
 * to the English default at render time (see `getSiteCopy`).
 */
export const SiteCopy: GlobalConfig = {
  slug: SITE_COPY_GLOBAL_SLUG,
  label: "Site Copy",
  admin: {
    description:
      "All guest-facing interface text. Each field is localized — switch locale in the top bar to edit French. Use separate lines for multi-line text and heading rows.",
  },
  fields: COPY_KEYS.map((key): Field =>
    MULTILINE_KEYS.has(key)
      ? {
          name: key,
          type: "textarea",
          label: labelFor(key),
          localized: true,
          defaultValue: DEFAULT_COPY.en[key],
        }
      : {
          name: key,
          type: "text",
          label: labelFor(key),
          localized: true,
          defaultValue: DEFAULT_COPY.en[key],
        },
  ),
};
