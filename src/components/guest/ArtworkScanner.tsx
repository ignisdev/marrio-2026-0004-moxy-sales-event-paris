"use client";

import { BrowserQRCodeReader } from "@zxing/browser";
import { DecodeHintType } from "@zxing/library";
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
  qrExternalUrls: string[];
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

    // Printed external/short URLs (e.g. rebrand.ly links) can't be resolved by
    // following the redirect offline, so match the scanned value against the
    // aliases stored on the artwork — by full URL or by trailing slug.
    const externalMatch = candidate.qrExternalUrls.some(
      (url) =>
        normalizeQrUrl(url) === normalizedScannedUrl ||
        getDynamicQrSlug(url) === dynamicSlug,
    );

    return (
      (candidate.qrDynamicSlug && candidate.qrDynamicSlug === dynamicSlug) ||
      (normalizedDynamicUrl && normalizedDynamicUrl === normalizedScannedUrl) ||
      externalMatch
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
  // Camera stream + decode loop driven manually (instead of ZXing's built-in
  // video decoder) so we can retry each frame inverted — the printed Moxy QR
  // codes are bright magenta on black, i.e. inverted relative to what the
  // default binarizer (dark-on-light) expects.
  const readerRef = useRef<BrowserQRCodeReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scanCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const handlingDecodeRef = useRef(false);
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
      stopScanning();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  function getReader() {
    if (!readerRef.current) {
      const hints = new Map();
      // TRY_HARDER does a more exhaustive scan — worth it for the low-contrast
      // magenta-on-black printed codes.
      hints.set(DecodeHintType.TRY_HARDER, true);
      readerRef.current = new BrowserQRCodeReader(hints);
    }
    return readerRef.current;
  }

  function handleDecodedValue(value: string) {
    const artwork = resolveArtworkFromScannedValue(artworks, value);

    if (!artwork) {
      // Keep scanning — an unrelated/garbage decode shouldn't abort the loop.
      setError("Artwork not found.");
      return;
    }

    // Guard against the interval firing again before React unwinds.
    if (handlingDecodeRef.current) {
      return;
    }
    handlingDecodeRef.current = true;

    stopScanning();
    setMatchedArtwork(artwork);
    setError(null);
    collectAndReveal(artwork);
  }

  /** Decode the current canvas, returning the text or null if nothing found. */
  function decodeCanvas(canvas: HTMLCanvasElement) {
    try {
      return getReader().decodeFromCanvas(canvas).getText();
    } catch {
      return null;
    }
  }

  /**
   * Grab one video frame and try to decode it both as captured and inverted.
   * The inverted pass is what makes the bright-on-dark Moxy codes readable.
   */
  function scanFrame() {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !video.videoWidth) {
      return;
    }

    let canvas = scanCanvasRef.current;
    if (!canvas) {
      canvas = document.createElement("canvas");
      scanCanvasRef.current = canvas;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      return;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // First pass: the frame as-is (handles any normal dark-on-light codes).
    let text = decodeCanvas(canvas);

    // Second pass: invert the pixels so light-on-dark codes look conventional.
    if (!text) {
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = image.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
      }
      ctx.putImageData(image, 0, 0);
      text = decodeCanvas(canvas);
    }

    if (text) {
      handleDecodedValue(text);
    }
  }

  async function startScanning() {
    setError(null);
    setMatchedArtwork(null);
    handlingDecodeRef.current = false;

    // Unlock the reveal video for unmuted playback while we still hold the tap
    // gesture (must run synchronously before any await).
    primeRevealVideo();

    if (!getParticipantUid()) {
      redirectToRegister();
      return;
    }

    const video = videoRef.current;
    if (!video) {
      setError("Camera unavailable.");
      return;
    }

    try {
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });
      streamRef.current = stream;
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      await video.play();

      // Poll frames a few times a second; each tick runs the dual (normal +
      // inverted) decode above.
      scanTimerRef.current = setInterval(scanFrame, 180);
    } catch {
      setIsScanning(false);
      stopStream();
      setError(copy.scannerCameraDenied);
    }
  }

  function stopStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    const video = videoRef.current;
    if (video) {
      try {
        video.srcObject = null;
      } catch {
        // ignore
      }
    }
  }

  function stopScanning() {
    if (scanTimerRef.current) {
      clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    stopStream();
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
