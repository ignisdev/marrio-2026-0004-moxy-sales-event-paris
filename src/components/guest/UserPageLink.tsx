"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { useCopy } from "@/components/guest/CopyProvider";
import { type Locale } from "@/config/locales";
import { guestRoutes } from "@/config/routes";
import { readParticipantUid, subscribeParticipantSession } from "@/config/storage";

const UserIcon = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="16"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="16"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export function UserPageLink({ locale }: { locale: Locale }) {
  const copy = useCopy();
  const uid = useSyncExternalStore(
    subscribeParticipantSession,
    () => readParticipantUid(),
    () => null,
  );

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const buttonClass =
    "grid place-items-center rounded-md border border-[var(--border)] px-3 py-2 text-[var(--muted)] transition hover:text-[var(--foreground)]";

  if (uid) {
    return (
      <Link aria-label={copy.navYourGallery} className={buttonClass} href={guestRoutes.gallery(locale)}>
        <UserIcon />
      </Link>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={copy.navAccount}
        className={buttonClass}
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <UserIcon />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[130px] overflow-hidden rounded-md border border-[var(--border)] bg-[var(--card)] shadow-lg">
          <Link
            className="block px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-[var(--foreground)] transition hover:bg-[var(--border)]"
            href={guestRoutes.register(locale)}
            onClick={() => setOpen(false)}
          >
            {copy.navRegister}
          </Link>
          <div className="h-px bg-[var(--border)]" />
          <Link
            className="block px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-[var(--foreground)] transition hover:bg-[var(--border)]"
            href={guestRoutes.login(locale)}
            onClick={() => setOpen(false)}
          >
            {copy.navSignIn}
          </Link>
        </div>
      )}
    </div>
  );
}
