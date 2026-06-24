"use client";

import { type ReactNode, useEffect, useState } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger delay in milliseconds. */
  delay?: number;
};

/**
 * Mount-triggered fade-up. Renders hidden, then flips to visible on the next
 * frame so the CSS transition always fires — on first load, client navigation,
 * and refresh alike. Unlike keyframe animations that start at opacity:0, this
 * can never leave content stuck invisible: the final state is plain visible.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // Double rAF: guarantees the hidden "from" state is painted before we flip
    // to visible, so the CSS transition reliably fires — Safari/iOS in
    // particular skips the transition when only a single rAF is used.
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setShown(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, []);

  return (
    <div
      className={[
        className,
        "transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none",
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
      ]
        .filter(Boolean)
        .join(" ")}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
