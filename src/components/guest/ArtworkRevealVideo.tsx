"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useCopy } from "@/components/guest/CopyProvider";

type ArtworkRevealVideoProps = {
  videoUrl: string;
  posterUrl: string | null;
  galleryHref: string;
};

/**
 * Full-screen artwork video takeover. The video plays unmuted with no controls
 * and, on completion, fades to black and routes to the gallery.
 *
 * iOS note: the <video> is kept fully opaque at all times. Animating a video
 * element's CSS opacity stops Safari compositing the video layer (you get audio
 * but a black frame), so the outro fade is a separate black overlay ON TOP of
 * the video rather than a fade of the video itself.
 *
 * iOS also blocks unmuted autoplay when the originating tap gesture is lost (as
 * here, arriving via a route change), so if play() is rejected we surface a
 * full-screen tap target that starts playback unmuted from a fresh gesture.
 */
export function ArtworkRevealVideo({
  videoUrl,
  posterUrl,
  galleryHref,
}: ArtworkRevealVideoProps) {
  const copy = useCopy();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [needsTap, setNeedsTap] = useState(false);
  const [awaitingUnmute, setAwaitingUnmute] = useState(false);
  const [outro, setOutro] = useState(false);

  async function play() {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    // Prefer unmuted. If the browser blocks it (e.g. a refresh, where there's
    // no user gesture), fall back to muted autoplay — always permitted — so the
    // video keeps playing, and arm a tap-anywhere layer to turn sound on.
    try {
      video.muted = false;
      await video.play();
      setNeedsTap(false);
      setAwaitingUnmute(false);
    } catch {
      try {
        video.muted = true;
        await video.play();
        setNeedsTap(false);
        setAwaitingUnmute(true);
      } catch {
        setNeedsTap(true);
      }
    }
  }

  function unmute() {
    const video = videoRef.current;
    if (video) {
      video.muted = false;
    }
    setAwaitingUnmute(false);
  }

  function end() {
    setOutro(true);
    window.setTimeout(() => router.push(galleryHref), 500);
  }

  useEffect(() => {
    void play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        disablePictureInPicture
        onEnded={end}
        onError={end}
        playsInline
        poster={posterUrl ?? undefined}
        preload="auto"
        ref={videoRef}
        src={videoUrl}
      />
      {needsTap ? (
        <button
          aria-label={copy.revealPlay}
          className="absolute inset-0 grid place-items-center bg-black/30"
          onClick={() => void play()}
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
      {awaitingUnmute ? (
        // Playing muted (autoplay fallback). Any tap turns sound on without
        // pausing. Transparent, with a small muted hint in the corner.
        <button
          aria-label={copy.revealTapForSound}
          className="absolute inset-0"
          onClick={unmute}
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
      {/* Outro fade — a black overlay on top, so the video layer is never
          animated via opacity (which iOS fails to composite). */}
      <div
        className={`pointer-events-none absolute inset-0 bg-black transition-opacity duration-500 ${
          outro ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
