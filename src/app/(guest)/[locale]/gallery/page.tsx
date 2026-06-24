import type { Viewport } from "next";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/guest/AppShell";
import { GalleryView } from "@/components/guest/GalleryView";
import { defaultEventSlug } from "@/config/constants";
import { type Locale } from "@/config/locales";
import { guestRoutes } from "@/config/routes";
import { getGalleryData } from "@/lib/galleryData";
import { getServerSessionUid } from "@/lib/session";

// iOS Safari tints its translucent status + address bars to this colour. The
// gallery backdrop is white at the top and a light grey floor at the bottom, so
// a light tint makes both bars blend with the image instead of going black.
// Per-route — the dark register/landing pages keep the global theme-color.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f3f3f3",
};

export default async function GalleryPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  if (!(await getServerSessionUid())) {
    redirect(`${guestRoutes.register(locale)}?event=${defaultEventSlug}`);
  }

  const { artworks, required } = await getGalleryData(locale);

  return (
    <AppShell locale={locale} mainClassName="bg-[#f3f3f3]" containerClassName="z-10 max-w-md" logoSrc="/images/moxy_hotels_logo.png" showLogo>
      <GalleryView artworks={artworks} locale={locale} required={required} />
    </AppShell>
  );
}
