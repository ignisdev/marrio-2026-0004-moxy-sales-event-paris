import { redirect } from "next/navigation";

import { defaultLocale } from "@/config/locales";

export default async function PublicProgressNoLocalePage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = await params;
  redirect(`/${defaultLocale}/u/${uid}`);
}
