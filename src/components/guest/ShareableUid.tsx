"use client";

import { useState } from "react";

import { useCopy } from "@/components/guest/CopyProvider";

type ShareableUidProps = {
  displayName: string | null;
  uid: string;
};

/**
 * Shows the participant's name with a tap-to-copy link to this page. The uid
 * acts as the savable link; copying writes the full page URL to the clipboard.
 */
export function ShareableUid({ displayName, uid }: ShareableUidProps) {
  const copyText = useCopy();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — no-op.
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {displayName ? <h1 className="text-2xl font-bold">{displayName}</h1> : null}
      <button
        className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition ${
          copied
            ? "border-[var(--success)] text-[var(--success)]"
            : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
        }`}
        onClick={copy}
        type="button"
      >
        <svg
          aria-hidden="true"
          fill="none"
          height="14"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="14"
        >
          <rect height="13" rx="2" ry="2" width="13" x="9" y="9" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        {copied ? copyText.shareCopied : uid}
      </button>
      <p className="text-xs text-[var(--muted)]">{copyText.shareCopyHint}</p>
    </div>
  );
}
