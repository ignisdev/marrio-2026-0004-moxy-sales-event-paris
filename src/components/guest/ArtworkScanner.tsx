"use client";

import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button, LinkButton } from "@/components/ui/Button";
import { defaultEventSlug } from "@/config/constants";
import { type Locale } from "@/config/locales";
import { guestRoutes } from "@/config/routes";
import {
  addCollectedArtworkSlugs,
  readParticipantUid,
  storageKeys,
} from "@/config/storage";
import { Multiline, useCopy } from "@/components/guest/CopyProvider";
import {
  getDynamicQrSlug,
  normalizeQrUrl,
  parseArtworkQrPayload,
} from "@/lib/qr";

export type ScannerArtwork = {
  eventSlug: string;
  locationLabel: string | null;
  posterUrl: string | null;
  qrDynamicDestination: string | null;
  qrDynamicSlug: string | null;
  qrDynamicUrl: string | null;
  qrPayload: string;
  qrToken: string;
  revealedImageUrl: string;
  slug: string;
  title: string;
  videoUrl: string | null;
};

type ArtworkScannerProps = {
  artworks: ScannerArtwork[];
  initialQrValue: string | null;
  initialUid: string | null;
  locale: Locale;
};

type ScanResponse = {
  artwork?: {
    slug: string;
    title: string;
  };
  isFirstScanForArtwork?: boolean;
  message?: string;
};

function resolveArtworkFromScannedValue(artworks: ScannerArtwork[], value: string) {
  const parsedPayload = parseArtworkQrPayload(value);

  if (parsedPayload) {
    return artworks.find(
      (candidate) =>
        candidate.eventSlug === parsedPayload.eventSlug &&
        candidate.qrToken === parsedPayload.qrToken,
    );
  }

  const normalizedScannedUrl = normalizeQrUrl(value);
  const dynamicSlug = getDynamicQrSlug(value);
  const dynamicSource = artworks.find((candidate) => {
    const normalizedDynamicUrl = candidate.qrDynamicUrl
      ? normalizeQrUrl(candidate.qrDynamicUrl)
      : null;

    return (
      (candidate.qrDynamicSlug && candidate.qrDynamicSlug === dynamicSlug) ||
      (normalizedDynamicUrl && normalizedDynamicUrl === normalizedScannedUrl)
    );
  });
  const destinationPayload = dynamicSource?.qrDynamicDestination || dynamicSource?.qrPayload;
  const parsedDestinationPayload = destinationPayload
    ? parseArtworkQrPayload(destinationPayload)
    : null;

  if (!parsedDestinationPayload) {
    return null;
  }

  return artworks.find(
    (candidate) =>
      candidate.eventSlug === parsedDestinationPayload.eventSlug &&
      candidate.qrToken === parsedDestinationPayload.qrToken,
  );
}

export function ArtworkScanner({
  artworks,
  initialQrValue,
  initialUid,
  locale,
}: ArtworkScannerProps) {
  const copy = useCopy();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const revealVideoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecordingScan, setIsRecordingScan] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [revealArtwork, setRevealArtwork] = useState<ScannerArtwork | null>(null);
  const [revealNeedsTap, setRevealNeedsTap] = useState(false);
  const [revealAwaitingUnmute, setRevealAwaitingUnmute] = useState(false);
  const [revealOutro, setRevealOutro] = useState(false);
  const [matchedArtwork, setMatchedArtwork] = useState<ScannerArtwork | null>(() =>
    initialQrValue ? resolveArtworkFromScannedValue(artworks, initialQrValue) || null : null,
  );
  const [participantUid, setParticipantUid] = useState(initialUid || "");

  useEffect(() => {
    if (!initialQrValue) {
      return;
    }

    // A QR deep-link (generic phone camera → /q/{slug} → /scanner?qr=...) must
    // not reveal artwork until the visitor has registered. Send them to
    // register, preserving the scanned value so the scan resumes afterwards.
    if (!getParticipantUid()) {
      redirectToRegister(initialQrValue);
      return;
    }

    if (matchedArtwork) {
      collectAndReveal(matchedArtwork);
    }
    // Run once for fallback /scanner?qr=... opens after first paint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      void controlsRef.current?.stop();
    };
  }, []);

  function getParticipantUid() {
    const uid = participantUid || readParticipantUid() || "";

    if (uid && uid !== participantUid) {
      setParticipantUid(uid);
    }

    return uid;
  }

  function queuePendingScan(artwork: ScannerArtwork, qrPayload: string) {
    const pendingScan = {
      artworkSlug: artwork.slug,
      locale,
      qrPayload,
      scannedAt: new Date().toISOString(),
      uid: getParticipantUid(),
    };
    const existing = JSON.parse(
      window.localStorage.getItem(storageKeys.pendingScans) || "[]",
    ) as unknown[];

    window.localStorage.setItem(
      storageKeys.pendingScans,
      JSON.stringify([...existing, pendingScan]),
    );
  }

  function redirectToRegister(qrForResume?: string) {
    const params = new URLSearchParams({ event: defaultEventSlug });
    if (qrForResume) {
      params.set("qr", qrForResume);
    }
    router.replace(`${guestRoutes.register(locale)}?${params.toString()}`);
  }

  /**
   * "Unlock" the reveal <video> within the camera-start tap (a real user
   * gesture) so it is allowed to play UNMUTED later, when the QR decode fires
   * asynchronously (decode callbacks carry no user activation, and navigating
   * away would destroy it — which is why the reveal happens in-place). Playing
   * any source once inside a gesture blesses the element for subsequent
   * programmatic play(). We use a 2px canvas stream so no asset is required.
   */
  function primeRevealVideo() {
    const video = revealVideoRef.current;
    if (!video) {
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 2;
      canvas.height = 2;
      const stream = (
        canvas as HTMLCanvasElement & { captureStream?: (fps?: number) => MediaStream }
      ).captureStream?.(0);
      if (!stream) {
        return;
      }
      video.muted = true;
      video.srcObject = stream;
      const played = video.play();
      if (played) {
        void played
          .then(() => {
            video.pause();
            video.srcObject = null;
          })
          .catch(() => {
            video.srcObject = null;
          });
      }
    } catch {
      // Best-effort only; a tap fallback covers any failure.
    }
  }

  /**
   * Offline-first reveal: persist progress locally, record the scan in the
   * background, then take over with the artwork video in-place (no route change
   * — preserving the unlocked <video>). Artworks without a video go straight to
   * the gallery. Collection requires a registered participant.
   */
  function collectAndReveal(artwork: ScannerArtwork) {
    if (!getParticipantUid()) {
      redirectToRegister(artwork.qrPayload);
      return;
    }

    addCollectedArtworkSlugs([artwork.slug]);
    window.setTimeout(() => {
      void recordScan(artwork, artwork.qrPayload);
    }, 0);

    if (artwork.videoUrl) {
      revealArtworkVideo(artwork);
    } else {
      router.push(guestRoutes.gallery(locale));
    }
  }

  function revealArtworkVideo(artwork: ScannerArtwork) {
    setRevealArtwork(artwork);
    setRevealOutro(false);

    const video = revealVideoRef.current;
    if (!video || !artwork.videoUrl) {
      router.push(guestRoutes.gallery(locale));
      return;
    }

    try {
      video.srcObject = null;
    } catch {
      // ignore
    }
    video.src = artwork.videoUrl;
    if (artwork.posterUrl) {
      video.poster = artwork.posterUrl;
    }
    video.muted = false;
    video.currentTime = 0;

    setRevealAwaitingUnmute(false);
    const played = video.play();
    if (played) {
      void played.then(() => setRevealNeedsTap(false)).catch(() => {
        // Unmuted blocked (e.g. activation lost) — fall back to muted autoplay
        // so the video keeps playing, and arm tap-anywhere to turn sound on.
        video.muted = true;
        void video
          .play()
          .then(() => {
            setRevealNeedsTap(false);
            setRevealAwaitingUnmute(true);
          })
          .catch(() => setRevealNeedsTap(true));
      });
    }
  }

  function endReveal() {
    setRevealOutro(true);
    window.setTimeout(() => router.push(guestRoutes.gallery(locale)), 500);
  }

  async function recordScan(artwork: ScannerArtwork, qrPayload: string) {
    const uid = getParticipantUid();

    if (!uid) {
      setError("Registration required.");
      return;
    }

    setIsRecordingScan(true);

    try {
      const response = await fetch("/api/scan", {
        body: JSON.stringify({
          locale,
          qrPayload,
          uid,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const result = (await response.json()) as ScanResponse;

      if (!response.ok) {
        setError(result.message || "Scan could not be recorded.");
        return;
      }
    } catch {
      queuePendingScan(artwork, qrPayload);
    } finally {
      setIsRecordingScan(false);
    }
  }

  function handleDecodedValue(value: string) {
    const artwork = resolveArtworkFromScannedValue(artworks, value);

    if (!artwork) {
      setError("Artwork not found.");
      return;
    }

    controlsRef.current?.stop();
    controlsRef.current = null;
    setIsScanning(false);
    setMatchedArtwork(artwork);
    setError(null);
    collectAndReveal(artwork);
  }

  async function startScanning() {
    setError(null);
    setMatchedArtwork(null);

    // Unlock the reveal video for unmuted playback while we still hold the tap
    // gesture (must run synchronously before any await).
    primeRevealVideo();

    if (!getParticipantUid()) {
      redirectToRegister();
      return;
    }

    if (!videoRef.current) {
      setError("Camera unavailable.");
      return;
    }

    try {
      setIsScanning(true);
      const codeReader = new BrowserQRCodeReader();
      controlsRef.current = await codeReader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result) => {
          const decodedText = result?.getText();

          if (decodedText) {
            void handleDecodedValue(decodedText);
          }
        },
      );
    } catch {
      setIsScanning(false);
      setError(copy.scannerCameraDenied);
    }
  }

  function stopScanning() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setIsScanning(false);
  }

  return (
    <>
    <section className="flex flex-1 flex-col justify-evenly gap-5">
      <h1 className="text-center text-2xl uppercase leading-none text-white font-[family-name:var(--font-title)]">
        <Multiline text={copy.scannerFound} />
      </h1>
      {/* Viewfinder: half-size square, centred, with corner framing guides. */}
      <div className="relative mx-auto aspect-square w-2/3 rounded-[20px] border-2 border-white bg-black p-5">
        <div className="relative h-full w-full overflow-hidden rounded-[12px]">
          <video
            className="h-full w-full object-cover"
            muted
            playsInline
            ref={videoRef}
          />
          {!isScanning && !matchedArtwork ? (
            <button
              aria-label={copy.scannerStartLabel}
              className="absolute inset-0 grid place-items-center bg-black/70"
              onClick={startScanning}
              type="button"
            >
              {/* Centred camera icon — tapping it starts the camera. */}
              <svg
                aria-hidden="true"
                className="h-10 w-10 text-white/80"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
          ) : null}
          {/* Corner positioning guides */}
          <span className="pointer-events-none absolute left-2 top-2 h-6 w-6 border-l-2 border-t-2 border-white" />
          <span className="pointer-events-none absolute right-2 top-2 h-6 w-6 border-r-2 border-t-2 border-white" />
          <span className="pointer-events-none absolute bottom-2 left-2 h-6 w-6 border-b-2 border-l-2 border-white" />
          <span className="pointer-events-none absolute bottom-2 right-2 h-6 w-6 border-b-2 border-r-2 border-white" />
        </div>
      </div>

      {matchedArtwork ? (
        <div className="space-y-1 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-center">
          <p className="text-sm font-semibold uppercase text-[var(--accent)]">
            {copy.scannerUnlocked}
          </p>
          <h1 className="text-2xl font-bold">{matchedArtwork.title}</h1>
          <p className="text-sm text-[var(--muted)]">{copy.scannerOpening}</p>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-md border border-red-400/50 bg-red-500/10 px-3 py-2 text-sm text-red-100">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col items-center gap-3">
        {isScanning ? (
          <Button type="button" onClick={stopScanning}>
            {copy.scannerStop}
          </Button>
        ) : null}
        <LinkButton href={guestRoutes.gallery(locale)}>{copy.scannerGoToGallery}</LinkButton>
      </div>

      {isRecordingScan ? (
        <p className="text-center text-sm text-[var(--muted)]">{copy.scannerSaving}</p>
      ) : null}
    </section>

    {/* Full-screen artwork video takeover. The container is always mounted so
        the <video> can be unlocked on the camera-start tap; it only becomes
        visible/interactive once an artwork with a video is revealed. The video
        is kept fully opaque (never opacity-animated) so iOS composites it; the
        outro fade is a separate black overlay on top. */}
    <div
      className={`fixed inset-0 z-50 bg-black transition-opacity duration-300 ${
        revealArtwork ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        disablePictureInPicture
        onEnded={endReveal}
        onError={endReveal}
        playsInline
        preload="auto"
        ref={revealVideoRef}
      />
      {revealArtwork && revealNeedsTap ? (
        <button
          aria-label={copy.revealPlay}
          className="absolute inset-0 grid place-items-center bg-black/30"
          onClick={() => {
            const video = revealVideoRef.current;
            if (!video) {
              return;
            }
            video.muted = false;
            void video
              .play()
              .then(() => setRevealNeedsTap(false))
              .catch(() => setRevealNeedsTap(true));
          }}
          type="button"
        >
          <svg
            aria-hidden="true"
            className="h-16 w-16 text-white/90"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      ) : null}
      {revealArtwork && revealAwaitingUnmute ? (
        <button
          aria-label={copy.revealTapForSound}
          className="absolute inset-0"
          onClick={() => {
            const video = revealVideoRef.current;
            if (video) {
              video.muted = false;
            }
            setRevealAwaitingUnmute(false);
          }}
          type="button"
        >
          <span className="absolute bottom-6 right-6 flex items-center gap-2 rounded-full bg-black/50 px-3 py-2 text-xs uppercase tracking-wide text-white">
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.06A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z" />
            </svg>
            {copy.revealTapForSound}
          </span>
        </button>
      ) : null}
      <div
        className={`pointer-events-none absolute inset-0 bg-black transition-opacity duration-500 ${
          revealOutro ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
    </>
  );
}
