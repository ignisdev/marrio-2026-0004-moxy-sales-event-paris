"use client";

import { type ReactNode, useEffect, useState } from "react";

/**
 * Next.js re-mounts templates on every navigation (forward, back, and on full
 * loads/refreshes), so this client mount-trigger guarantees the page fades into
 * place every time — not just on the first visit. The fade runs via a CSS
 * transition flipped on after mount, so it can never leave content stuck hidden.
 */
export default function GuestTemplate({ children }: { children: ReactNode }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // Double rAF so the initial hidden state is painted before flipping to
    // visible — Safari/iOS skips the transition with only a single rAF.
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
    // Opacity-only fade — no transform. A CSS transform here (even translate-y-0)
    // makes this wrapper the containing block for every `position: fixed`
    // descendant, which collapses full-screen fixed overlays (e.g. the artwork
    // video takeover and the gallery backdrop) to the wrapper's box instead of
    // the viewport. Keep this transform-free.
    <div
      className={`transition-opacity duration-500 ease-out motion-reduce:transition-none ${
        shown ? "opacity-100" : "opacity-0"
      }`}
    >
      {children}
    </div>
  );
}
