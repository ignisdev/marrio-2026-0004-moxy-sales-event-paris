import type { Locale } from "@/config/locales";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const otherLocale = locale === "en" ? "fr" : "en";

  return (
    <a
      className="rounded-md border border-[var(--border)] px-3 py-2 text-xs font-semibold uppercase text-[var(--muted)]"
      href={`/${otherLocale}/start`}
    >
      {otherLocale}
    </a>
  );
}
