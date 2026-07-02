import { redirect } from "next/navigation";

import { AppShell } from "@/components/guest/AppShell";
import { LandingExperience } from "@/components/guest/LandingExperience";
import { type Locale } from "@/config/locales";
import { guestRoutes } from "@/config/routes";
import { getServerSessionUid } from "@/lib/session";

export default async function StartPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ qr?: string | string[] }>;
}) {
  const { locale } = await params;
  const { qr } = await searchParams;
  const qrValue = Array.isArray(qr) ? qr[0] : qr || null;

  // Forward returning, registered visitors straight to the gallery before any
  // HTML renders — no flash of the start screen.
  if (await getServerSessionUid()) {
    redirect(
      qrValue
        ? `${guestRoutes.scanner(locale)}?qr=${encodeURIComponent(qrValue)}`
        : guestRoutes.gallery(locale),
    );
  }

  return (
    <AppShell
      locale={locale}
      mainClassName="text-white"
      containerClassName="bg-[url('/images/background.png')] bg-cover bg-top"
      showLogo
    >
      <LandingExperience locale={locale} qrValue={qrValue} />
    </AppShell>
  );
}
