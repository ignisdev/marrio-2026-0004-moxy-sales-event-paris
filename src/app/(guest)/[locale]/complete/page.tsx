import { AppShell } from "@/components/guest/AppShell";
import { LinkButton } from "@/components/ui/Button";
import { type Locale } from "@/config/locales";
import { guestRoutes } from "@/config/routes";
import { getSiteCopy } from "@/lib/siteCopy.server";

export default async function CompletePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const copy = await getSiteCopy(locale);

  return (
    <AppShell locale={locale}>
      <section className="flex flex-1 flex-col justify-center gap-5">
        <p className="text-sm font-semibold uppercase text-[var(--accent)]">{copy.rewardEligible}</p>
        <h1 className="text-4xl font-black">{copy.completeTitle}</h1>
        <p className="text-[var(--muted)]">{copy.completeVerifyNote}</p>
        <LinkButton href={guestRoutes.gallery(locale)}>{copy.completeViewGallery}</LinkButton>
      </section>
    </AppShell>
  );
}
