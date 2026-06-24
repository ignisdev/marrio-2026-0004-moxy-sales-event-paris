import { notFound } from "next/navigation";

import { AppShell } from "@/components/guest/AppShell";
import { PublicProgressView } from "@/components/guest/PublicProgressView";
import { Reveal } from "@/components/guest/Reveal";
import { LinkButton } from "@/components/ui/Button";
import { type Locale } from "@/config/locales";
import { guestRoutes } from "@/config/routes";
import { getPublicProgress } from "@/lib/publicProgress";
import { getSiteCopy } from "@/lib/siteCopy.server";

export default async function PublicProgressPage({
  params,
}: {
  params: Promise<{ locale: Locale; uid: string }>;
}) {
  const { locale, uid } = await params;
  const [progress, copy] = await Promise.all([
    getPublicProgress(uid, locale),
    getSiteCopy(locale),
  ]);

  if (!progress) {
    notFound();
  }

  return (
    <AppShell locale={locale}>
      <div className="flex flex-1 flex-col gap-8">
        <PublicProgressView data={progress} />
        <Reveal delay={120 + progress.artworks.length * 80 + 120}>
          <LinkButton className="w-full" href={guestRoutes.gallery(locale)}>
            {copy.completeBack}
          </LinkButton>
        </Reveal>
      </div>
    </AppShell>
  );
}
