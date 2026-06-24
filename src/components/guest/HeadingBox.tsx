"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

/**
 * The signature three-row Moxy box: a white panel with a 4px black border and
 * 4px dividers, each row in the Knockout display face. Rows can hold text
 * (e.g. PIXEL / PERFECT!) or arbitrary content such as the Moxy logo.
 *
 * Each row runs a pixel-reveal effect: JS removes the "pixel-blur" class after a
 * double rAF + per-row delay, triggering a CSS transition from blurry to sharp.
 * This avoids animation fill-mode bugs on Safari (delayed CSS animations with
 * fill:forwards don't reliably override a static opacity:0 on the same element).
 */
export function HeadingBox({
  rows,
  className,
}: {
  rows: ReactNode[];
  className?: string;
}) {
  const rowRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const rafs: number[] = [];

    const outer = requestAnimationFrame(() => {
      const inner = requestAnimationFrame(() => {
        rowRefs.current.forEach((el, index) => {
          if (!el) return;
          const t = setTimeout(() => {
            el.classList.remove("pixel-blur");
          }, index * 90);
          timers.push(t);
        });
      });
      rafs.push(inner);
    });
    rafs.push(outer);

    return () => {
      rafs.forEach(cancelAnimationFrame);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div
      className={twMerge(
        "flex w-full max-w-[298px] mx-auto flex-col divide-y-4 divide-black border-4 border-black bg-white text-center text-[2.8rem] font-normal uppercase leading-none text-black font-[family-name:var(--font-title)]",
        className,
      )}
    >
      {rows.map((row, index) => (
        <div
          className="flex h-[7.47dvh] items-center justify-center px-2"
          key={index}
        >
          <span
            ref={(el) => {
              rowRefs.current[index] = el;
            }}
            className="pixel-blur pixel-reveal-t inline-block"
          >
            {row}
          </span>
        </div>
      ))}
    </div>
  );
}
