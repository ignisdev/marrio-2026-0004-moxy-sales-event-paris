"use client";

import { useEffect, useState } from "react";

const maxWaitMs = 8000;

/**
 * True once every url in the list has finished loading (or failed — a broken
 * image shouldn't hang the gallery forever). Used to hold a full-gallery
 * loading state until artwork photos are actually decoded and ready to paint,
 * instead of letting each frame pop in individually as bytes arrive.
 */
export function useImagesPreloaded(urls: string[]): boolean {
  const [readyUrls, setReadyUrls] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled) {
        setReadyUrls(new Set(urls));
      }
    }, maxWaitMs);

    urls.forEach((url) => {
      const img = new window.Image();
      const markReady = () => {
        if (cancelled) {
          return;
        }
        setReadyUrls((prev) => (prev.has(url) ? prev : new Set(prev).add(url)));
      };
      img.onload = markReady;
      img.onerror = markReady;
      img.src = url;
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [urls]);

  return urls.every((url) => readyUrls.has(url));
}
