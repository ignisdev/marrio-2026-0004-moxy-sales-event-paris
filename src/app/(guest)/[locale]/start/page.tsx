import { redirect } from "next/navigation";

import { AppShell } from "@/components/guest/AppShell";
import { LandingExperience } from "@/components/guest/LandingExperience";
import { type Locale } from "@/config/locales";
import { guestRoutes } from "@/config/routes";
import { getServerSessionUid } from "@/lib/session";

export default async function StartPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  // Forward returning, registered visitors straight to the gallery before any
  // HTML renders — no flash of the start screen.
  if (await getServerSessionUid()) {
    redirect(guestRoutes.gallery(locale));
  }

  return (
    <AppShell
      locale={locale}
      mainClassName="text-white"
      containerClassName="bg-[url('/images/background.png')] bg-cover bg-top"
      showLogo
    >
      <LandingExperience locale={locale} />
    </AppShell>
  );
}
