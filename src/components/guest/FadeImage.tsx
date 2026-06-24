"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";

type FadeImageProps = {
  alt: string;
  className?: string;
  /** Apply a desaturated, dimmed treatment (used for locked artworks). */
  dimmed?: boolean;
  src: string;
  style?: CSSProperties;
};

/**
 * Image that fades in once decoded instead of popping into place. Handles the
 * cached case (where the load event can fire before React attaches a handler)
 * by checking `complete` on mount.
 */
export function FadeImage({ alt, className, dimmed, src, style }: FadeImageProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  return (
    <img
      alt={alt}
      className={[
        className,
        "transition-[opacity,filter] duration-700 ease-out",
        loaded ? "opacity-100" : "opacity-0",
        dimmed ? "grayscale brightness-[.45]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onLoad={() => setLoaded(true)}
      ref={ref}
      src={src}
      style={style}
    />
  );
}
