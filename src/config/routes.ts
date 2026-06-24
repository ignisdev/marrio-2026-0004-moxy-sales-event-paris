import type { Locale } from "./locales";

export const guestRoutes = {
  complete: (locale: Locale) => `/${locale}/complete`,
  gallery: (locale: Locale) => `/${locale}/gallery`,
  login: (locale: Locale) => `/${locale}/login`,
  publicProgress: (locale: Locale, uid: string) => `/${locale}/u/${uid}`,
  register: (locale: Locale) => `/${locale}/register`,
  scan: (locale: Locale, artworkSlug: string) => `/${locale}/scan/${artworkSlug}`,
  scanner: (locale: Locale, uid?: string) =>
    `/${locale}/scanner${uid ? `?uid=${encodeURIComponent(uid)}` : ""}`,
  start: (locale: Locale) => `/${locale}/start`,
};
