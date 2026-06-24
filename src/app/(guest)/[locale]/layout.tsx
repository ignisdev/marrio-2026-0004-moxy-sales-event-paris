import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { CopyProvider } from "@/components/guest/CopyProvider";
import { isLocale } from "@/config/locales";
import { getSiteCopy } from "@/lib/siteCopy.server";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const copy = await getSiteCopy(locale);

  return <CopyProvider value={copy}>{children}</CopyProvider>;
}
