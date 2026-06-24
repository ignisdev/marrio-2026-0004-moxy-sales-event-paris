import configPromise from "@payload-config";
import { notFound, redirect } from "next/navigation";
import { getPayload } from "payload";

import { ArtworkRevealVideo } from "@/components/guest/ArtworkRevealVideo";
import { defaultEventSlug } from "@/config/constants";
import { type Locale } from "@/config/locales";
import { guestRoutes } from "@/config/routes";
import { resolveMediaUrl } from "@/lib/media";
import { getServerSessionUid } from "@/lib/session";

export default async function ScanPage({
  params,
}: {
  params: Promise<{ artworkSlug: string; locale: Locale }>;
}) {
  const { artworkSlug, locale } = await params;

  if (!(await getServerSessionUid())) {
    redirect(`${guestRoutes.register(locale)}?event=${defaultEventSlug}`);
  }

  const payload = await getPayload({ config: configPromise });
  const artworkResult = await payload.find({
    collection: "artworks",
    depth: 1,
    limit: 1,
    locale,
    where: {
      and: [
        { slug: { equals: artworkSlug } },
        { isActive: { equals: true } },
      ],
    },
  });
  const artwork = artworkResult.docs[0];

  if (!artwork) {
    notFound();
  }

  const videoUrl = resolveMediaUrl(artwork.videoAsset);
  const posterUrl = resolveMediaUrl(artwork.posterImage);

  // Re-viewing a collected artwork (or a deep link) replays the full-screen
  // video takeover, then routes to the gallery. No video → nothing to show, so
  // go straight to the gallery.
  if (!videoUrl) {
    redirect(guestRoutes.gallery(locale));
  }

  return (
    <ArtworkRevealVideo
      galleryHref={guestRoutes.gallery(locale)}
      posterUrl={posterUrl}
      videoUrl={videoUrl}
    />
  );
}
