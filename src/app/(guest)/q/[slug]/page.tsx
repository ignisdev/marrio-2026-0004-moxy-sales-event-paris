import { redirect } from "next/navigation";

import { defaultLocale } from "@/config/locales";
import { guestRoutes } from "@/config/routes";
import { getServerSessionUid } from "@/lib/session";

export default async function DynamicQrFallbackPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const qrValue = encodeURIComponent(slug);

  // First-time scanners haven't seen the landing/how-to-play intro yet — send
  // them there first, carrying the qr value through to registration and back.
  // Returning, already-registered participants skip straight to the scanner.
  if (!(await getServerSessionUid())) {
    redirect(`${guestRoutes.start(defaultLocale)}?qr=${qrValue}`);
  }

  redirect(`${guestRoutes.scanner(defaultLocale)}?qr=${qrValue}`);
}
