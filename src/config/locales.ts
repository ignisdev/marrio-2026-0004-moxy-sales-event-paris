export const defaultLocale = "en";
export const supportedLocales = ["en", "fr"] as const;

export type Locale = (typeof supportedLocales)[number];

export function isLocale(value: string | undefined): value is Locale {
  return supportedLocales.includes(value as Locale);
}
