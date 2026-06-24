import configPromise from "@payload-config";
import { getPayload } from "payload";

import {
  ArtworkScanner,
  type ScannerArtwork,
} from "@/components/guest/ArtworkScanner";
import { AppShell } from "@/components/guest/AppShell";
import { defaultEventSlug } from "@/config/constants";
import { type Locale } from "@/config/locales";
import { buildArtworkQrPayload } from "@/lib/qr";
import { resolveMediaUrl, resolveMediaUrlOrPlaceholder } from "@/lib/media";

export default async function ScannerPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ qr?: string | string[]; uid?: string | string[] }>;
}) {
  const { locale } = await params;
  const { qr, uid } = await searchParams;
  const payload = await getPayload({ config: configPromise });
  const events = await payload.find({
    collection: "events",
    limit: 1,
    where: {
      slug: {
        equals: defaultEventSlug,
      },
    },
  });
  const event = events.docs[0];
  const artworks: ScannerArtwork[] = [];

  if (event) {
    const artworkResult = await payload.find({
      collection: "artworks",
      depth: 1,
      limit: 100,
      locale,
      sort: "displayOrder",
      where: {
        and: [
          {
            event: {
              equals: event.id,
            },
          },
          {
            isActive: {
              equals: true,
            },
          },
          {
            qrIsActive: {
              equals: true,
            },
          },
        ],
      },
    });

    artworks.push(
      ...artworkResult.docs.map((artwork) => ({
        eventSlug: event.slug,
        locationLabel: artwork.locationLabel || null,
        qrPayload: buildArtworkQrPayload({
          eventSlug: event.slug,
          qrToken: artwork.qrToken,
        }),
        qrDynamicDestination: artwork.qrDynamicDestination || null,
        qrDynamicSlug: artwork.qrDynamicSlug || null,
        qrDynamicUrl: artwork.qrDynamicUrl || null,
        qrToken: artwork.qrToken,
        posterUrl: resolveMediaUrl(artwork.posterImage),
        revealedImageUrl: resolveMediaUrlOrPlaceholder(artwork.revealedImage),
        slug: artwork.slug,
        title: artwork.title,
        videoUrl: resolveMediaUrl(artwork.videoAsset),
      })),
    );
  }

  const initialUid = Array.isArray(uid) ? uid[0] : uid || null;
  const initialQrValue = Array.isArray(qr) ? qr[0] : qr || null;

  return (
    <AppShell locale={locale} mainClassName="bg-black text-white" logoSrc="/images/moxy_hotels_purple_logo.png" showLogo>
      <ArtworkScanner
        artworks={artworks}
        initialQrValue={initialQrValue}
        initialUid={initialUid}
        locale={locale}
      />
    </AppShell>
  );
}
