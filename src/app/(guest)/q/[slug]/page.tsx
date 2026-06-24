import { redirect } from "next/navigation";

import { defaultLocale } from "@/config/locales";
import { guestRoutes } from "@/config/routes";

export default async function DynamicQrFallbackPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  redirect(`${guestRoutes.scanner(defaultLocale)}?qr=${encodeURIComponent(slug)}`);
}
