import "server-only";

import configPromise from "@payload-config";
import { cache } from "react";
import { getPayload } from "payload";

import type { Locale } from "@/config/locales";
import {
  DEFAULT_COPY,
  mergeCopy,
  SITE_COPY_GLOBAL_SLUG,
  type SiteCopy,
} from "@/lib/copy";

/**
 * Resolve the active site copy for a locale: the CMS `site-copy` global overlaid
 * on the baked-in defaults (an empty CMS field falls back to its default). Wrapped
 * in React `cache` so multiple calls within one request share a single DB read.
 * Any failure (e.g. DB unavailable) falls back to the defaults so pages still render.
 */
export const getSiteCopy = cache(async (locale: Locale): Promise<SiteCopy> => {
  const defaults = DEFAULT_COPY[locale] ?? DEFAULT_COPY.en;
  try {
    const payload = await getPayload({ config: configPromise });
    const global = (await payload.findGlobal({
      slug: SITE_COPY_GLOBAL_SLUG,
      locale,
      fallbackLocale: "en",
      depth: 0,
    })) as Partial<Record<keyof SiteCopy, unknown>>;
    return mergeCopy(defaults, global);
  } catch {
    return defaults;
  }
});
