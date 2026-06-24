import type { Locale } from "@/config/locales";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const otherLocale = locale === "en" ? "fr" : "en";

  return (
    <a
      className="border-[0.5px] border-black px-3 py-2 text-xs font-semibold uppercase text-white font-[family-name:var(--font-title)]"
      href={`/${otherLocale}/start`}
    >
      {otherLocale}
    </a>
  );
}
