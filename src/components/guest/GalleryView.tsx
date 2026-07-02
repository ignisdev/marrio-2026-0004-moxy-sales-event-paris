"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { FadeImage } from "@/components/guest/FadeImage";
import { HeadingBox } from "@/components/guest/HeadingBox";
import { Reveal } from "@/components/guest/Reveal";
import { Button, LinkButton } from "@/components/ui/Button";
import { Multiline, useCopy } from "@/components/guest/CopyProvider";
import { useImagesPreloaded } from "@/hooks/useImagesPreloaded";
import { type Locale } from "@/config/locales";
import { guestRoutes } from "@/config/routes";
import { toLines } from "@/lib/copy";
import {
  addCollectedArtworkSlugs,
  getCollectedArtworkSlugsServerSnapshot,
  getCollectedArtworkSlugsSnapshot,
  readParticipantUid,
  subscribeCollectedArtworkSlugs,
} from "@/config/storage";
import type { GalleryArtwork } from "@/lib/galleryData";
import type { GalleryProgress } from "@/types/domain";

/**
 * Per-artwork picture frame. The PNG centres are transparent, so each frame is
 * laid over the artwork image. `ar` is the frame's native aspect ratio (w/h);
 * `pad` is how far the artwork is inset so it tucks just under the frame edge.
 * Index 0..4 maps to artwork 0..4 — column one shows frames 1–2 (the wide
 * 324px frames), column two shows frames 3–5 (the 212px frames).
 * TODO: pad values are eyeballed against each frame's transparent window —
 * fine-tune once exact frame artboards are confirmed.
 */
const FRAMES = [
  { src: "/images/frame1.webp", ar: 1326 / 1549, pad: "12%" },
  // object-cover centers its crop by default, which was trimming the top of
  // the artwork photo to keep it vertically centred in the window. Anchoring
  // the crop to the top keeps the full top of the graphic and trims from the
  // bottom instead.
  { src: "/images/frame2.webp", ar: 1309 / 1592, objectPosition: "center top", pad: "12%" },
  { src: "/images/frame3.webp", ar: 821 / 946, pad: "13%" },
  { src: "/images/frame4.webp", ar: 818 / 987, pad: "13%" },
  { src: "/images/frame5.webp", ar: 866 / 1123, pad: "13%" },
];

// Column widths as a share of the 592px-wide wall region: frames 1–2 are 324px
// (324/592) and frames 3–5 are 212px (212/592).
const COLUMN_ONE_WIDTH = `${(324 / 592) * 100}%`;
const COLUMN_TWO_WIDTH = `${(212 / 592) * 100}%`;

type GalleryViewProps = {
  artworks: GalleryArtwork[];
  locale: Locale;
  required: number;
};

export function GalleryView({ artworks, locale, required }: GalleryViewProps) {
  const copy = useCopy();
  const title = copy.galleryTitle;
  // Offline-first: render local progress immediately via an external store
  // (no SSR/client hydration mismatch — server snapshot is empty).
  const collectedSlugs = useSyncExternalStore(
    subscribeCollectedArtworkSlugs,
    getCollectedArtworkSlugsSnapshot,
    getCollectedArtworkSlugsServerSnapshot,
  );

  // Reconcile with authoritative server progress when a uid + connectivity are
  // available; writing back to the store re-renders through the subscription.
  useEffect(() => {
    const uid = readParticipantUid();
    if (!uid) {
      return;
    }

    let cancelled = false;
    void fetch(`/api/progress?uid=${encodeURIComponent(uid)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((progress: GalleryProgress | null) => {
        if (cancelled || !progress?.collectedArtworkSlugs) {
          return;
        }
        addCollectedArtworkSlugs(progress.collectedArtworkSlugs);
      })
      .catch(() => {
        // Offline or transient error — keep the local view.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const collectedSet = useMemo(() => new Set(collectedSlugs), [collectedSlugs]);
  const collectedCount = useMemo(
    () => artworks.filter((artwork) => collectedSet.has(artwork.slug)).length,
    [artworks, collectedSet],
  );
  const isComplete = required > 0 && collectedCount >= required;
  const ctaDelay = 120 + artworks.length * 90 + 120;

  // Preload every collected artwork's photo before revealing the wall, so
  // frames never sit empty mid-fetch and then pop in one by one — the whole
  // gallery appears together once it's actually ready to paint.
  const collectedImageUrls = useMemo(
    () =>
      artworks
        .filter((artwork) => collectedSet.has(artwork.slug))
        .map((artwork) => artwork.revealedImageUrl)
        .filter((url): url is string => Boolean(url)),
    [artworks, collectedSet],
  );
  const imagesPreloaded = useImagesPreloaded(collectedImageUrls);
  // Once shown, stay shown — a later reconciliation adding newly-collected
  // slugs shouldn't re-hide a gallery the guest is already looking at.
  const [galleryRevealed, setGalleryRevealed] = useState(false);
  useEffect(() => {
    if (imagesPreloaded && !galleryRevealed) {
      setGalleryRevealed(true);
    }
  }, [imagesPreloaded, galleryRevealed]);

  // Completion overlay shows by default whenever the gallery is complete. The
  // "Back to Gallery" button dismisses it for this view; on a fresh visit (the
  // component remounts) it shows again.
  const [completionDismissed, setCompletionDismissed] = useState(false);

  // The progress dial (collected / required), shared by the in-progress and
  // completed states.
  function renderProgressCircle() {
    return (
      <svg fill="none" className="w-[clamp(70px,10.37dvh,100px)] h-[clamp(70px,10.37dvh,100px)]" viewBox="0 0 100 100">
        <circle cx="50" cy="50" fill="#f7eeeb" r="50" />
        <defs>
          {/* Clockwise arc spanning the upper portion of the circle — text faces inward */}
          <path d="M 14,44 A 37,37 0 0,1 86,44" id="topArc" />
        </defs>
        <text
          fill="#1a1a1a"
          fontFamily="var(--font-title)"
          fontSize="13"
          fontWeight="normal"
          letterSpacing="auto"
        >
          <textPath href="#topArc" startOffset="50%" textAnchor="middle">
            {copy.galleryYouHaveFound}
          </textPath>
        </text>
        <text
          dominantBaseline="auto"
          fill="#1a1a1a"
          fontFamily="var(--font-title)"
          fontSize="38"
          fontWeight="light"
          textAnchor="middle"
          x="50"
          y="65"
        >
          {collectedCount}/{required}
        </text>
      </svg>
    );
  }

  // One framed artwork. Found → the revealed image fills the frame and the frame
  // links through to the scan/reveal video. Not yet found → an empty frame, inert.
  // No grey-out, label, or title.
  function renderFrame(index: number) {
    const artwork = artworks[index];
    const frame = FRAMES[index];
    if (!artwork || !frame) {
      return null;
    }

    const isCollected = collectedSet.has(artwork.slug);
    const href = guestRoutes.scan(locale, artwork.slug);

    const framed = (
      <div className="relative w-full" style={{ aspectRatio: String(frame.ar) }}>
        <div className="absolute overflow-hidden" style={{ inset: frame.pad }}>
          {isCollected && artwork.revealedImageUrl ? (
            <FadeImage
              alt={artwork.title}
              className="h-full w-full object-cover"
              src={artwork.revealedImageUrl}
              style={frame.objectPosition ? { objectPosition: frame.objectPosition } : undefined}
            />
          ) : null}
        </div>
        {/* Ornate frame overlay — its centre is transparent. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
          src={frame.src}
        />
      </div>
    );

    return (
      <Reveal className="w-full shrink-0" delay={120 + index * 90} key={artwork.slug}>
        {isCollected ? (
          <Link
            className="block w-full transition-transform duration-300 active:scale-[0.98] focus:outline-none"
            href={href}
          >
            {framed}
          </Link>
        ) : (
          <div aria-disabled className="block w-full">
            {framed}
          </div>
        )}
      </Reveal>
    );
  }

  return (
    <>
      {/* Loading takeover — covers the wall until every collected artwork's
          photo has actually decoded, so nothing pops in as it arrives over
          the network. Continues the video reveal's black background, then
          dissolves once the gallery is ready. */}
      <div
        aria-hidden={galleryRevealed}
        className={`fixed inset-0 z-[120] flex items-center justify-center bg-black transition-opacity duration-500 ${
          galleryRevealed ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/25 border-t-white" />
      </div>

      {/*
        Full-bleed gallery backdrop. The 908×1480 image keeps its true aspect
        ratio (no squashing) and is scaled to COVER the viewport — the excess
        bleeds off the edges and is clipped by the overflow-hidden wrapper. The
        inner box is sized to the larger of (viewport width) or (the width needed
        for the image height to cover the viewport), so it always covers while
        the box's own ratio matches the image exactly.
      */}
      <div className="fixed bottom-0 left-1/2 z-0 w-full max-w-md -translate-x-1/2 overflow-hidden" style={{ top: "min(140px, calc(11.3dvh + 14px))" }}>
        {title && (
          <div className="relative z-10 px-5 pt-[clamp(0px,calc(18px-1.5dvh),10px)] text-center">
            <p className="text-[clamp(1.6rem,4.65dvh,2.8rem)] font-normal uppercase leading-none text-black font-[family-name:var(--font-title)]">
              {title}
            </p>
          </div>
        )}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: "calc(-5% - 20px)",
            width: "max(calc(110% - 20px), calc((88.7dvh - 14px) * 1044 / 1480 - 20px), calc((100dvh - 140px) * 1044 / 1480 - 20px))",
            aspectRatio: "908 / 1480",
            backgroundImage: "url(/images/gallery_bg.webp)",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/*
            Two-column gallery wall, positioned relative to the (correctly
            proportioned) image box. Column one stacks the two wide frames
            (1 & 2); column two stacks the three narrower frames (3, 4 & 5).
            Insets match the wall region in the source image (159px L/R, 162px
            top, 424px bottom), so the frames always sit on the painted wall.
          */}
          <div
            className="absolute flex justify-evenly"
            style={{
              left: "17.511%",
              right: "17.511%",
              top: "10.946%",
              bottom: "28.649%",
            }}
          >
            <div
              className="flex flex-col items-center justify-between py-6"
              style={{ width: COLUMN_ONE_WIDTH }}
            >
              {renderFrame(0)}
              {renderFrame(1)}
            </div>
            <div
              className="flex flex-col items-center justify-between py-6"
              style={{ width: COLUMN_TWO_WIDTH }}
            >
              {renderFrame(2)}
              {renderFrame(3)}
              {renderFrame(4)}
            </div>
          </div>

          <div
            className="absolute inset-x-0 flex flex-col items-center gap-4 px-5"
            style={{ top: "72.351%" }}
          >
            <Reveal delay={ctaDelay}>
              {isComplete ? (
                <div className="flex flex-col items-center">{renderProgressCircle()}</div>
              ) : (
                <div className="flex flex-col items-center gap-[clamp(0.5rem,2.07dvh,1.25rem)]">
                  {renderProgressCircle()}
                  <LinkButton href={guestRoutes.scanner(locale)}>
                    {copy.galleryScanArtwork}
                  </LinkButton>
                  <p className="-mt-2 text-xs uppercase tracking-widest text-white font-[family-name:var(--font-title)]">
                    {copy.galleryTapToOpen}
                  </p>
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </div>

      {/* Completion takeover — shown by default whenever the gallery is
          complete, dismissed (for this visit) by "Back to Gallery". A fresh
          visit remounts and shows it again. */}
      {isComplete && !completionDismissed ? (
        <div className="fixed inset-0 z-[100] h-[100dvh] w-full bg-black/75">
          {/* Mirrors the AppShell container (px-5 py-5) + header row so the
              heading and button land at the same Y as the landing/register
              pages, which sit below that header. */}
          <div className="relative mx-auto flex h-full w-full max-w-md flex-col px-5 py-5 text-center">
            <div className="mb-4 h-9 shrink-0" />
            <div className="relative flex flex-1 flex-col">
              {/* HeadingBox positioned exactly like the landing / register pages. */}
              <div className="pt-[10.58dvh]">
                <div className="mx-auto w-[79.46%]">
                  <HeadingBox rows={toLines(copy.headingPixelPerfect)} />
                </div>
              </div>
              <h2 className="mt-[6dvh] text-5xl uppercase leading-tight text-white font-[family-name:var(--font-title)]">
                {copy.completeCongrats}
              </h2>
              <h3 className="mt-3 text-4xl uppercase text-white font-[family-name:var(--font-title)]">
                <Multiline text={copy.completeGallery} />
              </h3>
              <p className="mt-5 text-lg uppercase leading-tight text-white font-[family-name:var(--font-title)]">
                <Multiline text={copy.completeClaim} />
              </p>
              {/* Anchored to the same spot as the Play / Register / Submit
                  buttons (panels sit -bottom-5 with pb-[clamp(1.5rem,4.77dvh,46px)]). */}
              <div className="absolute -bottom-5 left-0 right-0 flex justify-center px-5 pb-[clamp(1.5rem,4.77dvh,46px)]">
                <Button type="button" onClick={() => setCompletionDismissed(true)}>
                  {copy.completeBack}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
