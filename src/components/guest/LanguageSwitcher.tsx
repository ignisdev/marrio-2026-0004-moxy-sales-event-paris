import type { Locale } from "@/config/locales";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const otherLocale = locale === "en" ? "fr" : "en";

  return (
    <a
      className="border-[0.5px] border-[#8c0980] px-3 py-2 text-xs font-semibold uppercase text-[#8c0980] font-[family-name:var(--font-title)]"
      href={`/${otherLocale}/start`}
    >
      {otherLocale}
    </a>
  );
}
