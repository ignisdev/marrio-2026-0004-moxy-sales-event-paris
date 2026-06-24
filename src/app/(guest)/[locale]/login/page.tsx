import Link from "next/link";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/guest/AppShell";
import { HeadingBox } from "@/components/guest/HeadingBox";
import { LoginForm } from "@/components/guest/LoginForm";
import { type Locale } from "@/config/locales";
import { guestRoutes } from "@/config/routes";
import { toLines } from "@/lib/copy";
import { getServerSessionUid } from "@/lib/session";
import { getSiteCopy } from "@/lib/siteCopy.server";

export default async function LoginPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  if (await getServerSessionUid()) {
    redirect(guestRoutes.gallery(locale));
  }

  const copy = await getSiteCopy(locale);

  return (
    <AppShell locale={locale} mainClassName="bg-black text-white">
      <section className="flex flex-1 flex-col items-center justify-evenly gap-8 py-6 text-center">
        <HeadingBox rows={toLines(copy.loginHeading)} />
        <p className="font-[family-name:var(--font-title)] text-base uppercase leading-none text-white">
          {copy.loginPrompt}
        </p>
        <LoginForm locale={locale} />
        <p className="text-xs uppercase text-white/50">
          {copy.loginNewHere}{" "}
          <Link className="underline hover:text-white" href={guestRoutes.register(locale)}>
            {copy.loginRegisterLink}
          </Link>
        </p>
      </section>
    </AppShell>
  );
}
