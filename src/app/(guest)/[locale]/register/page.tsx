import { redirect } from "next/navigation";

import { AppShell } from "@/components/guest/AppShell";
import { HeadingBox } from "@/components/guest/HeadingBox";
import { RegisterForm } from "@/components/guest/RegisterForm";
import { type Locale } from "@/config/locales";
import { guestRoutes } from "@/config/routes";
import { toLines } from "@/lib/copy";
import { getServerSessionUid } from "@/lib/session";
import { getSiteCopy } from "@/lib/siteCopy.server";

export default async function RegisterPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  if (await getServerSessionUid()) {
    redirect(guestRoutes.gallery(locale));
  }

  const copy = await getSiteCopy(locale);

  return (
    <AppShell
      locale={locale}
      mainClassName="text-white"
      containerClassName="bg-[url('/images/background.png')] bg-cover bg-top"
      showLogo
    >
      <div className="relative flex flex-1 flex-col text-center">
        <div className="relative z-10 pt-[10.58dvh]">
          <div className="mx-auto w-[79.46%]">
            <HeadingBox rows={toLines(copy.headingRegister)} />
          </div>
        </div>
        <div className="absolute z-0 -bottom-5 -left-5 -right-5 h-[63.28dvh] bg-black px-5 pt-[clamp(3rem,9.54dvh,92px)] pb-[clamp(1.5rem,4.77dvh,46px)] flex flex-col items-center overflow-y-auto">
          <RegisterForm locale={locale} />
        </div>
      </div>
    </AppShell>
  );
}
