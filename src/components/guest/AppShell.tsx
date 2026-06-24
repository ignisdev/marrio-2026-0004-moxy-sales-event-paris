import Image from "next/image";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

import type { Locale } from "@/config/locales";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function AppShell({
  children,
  locale,
  mainClassName,
  containerClassName,
  showLogo = false,
  logoSrc = "/images/moxy_hotels_white_logo.png",
}: {
  children: ReactNode;
  locale: Locale;
  /** Optional override for the outer page element. */
  mainClassName?: string;
  /** Optional override for the inner max-w-md container. */
  containerClassName?: string;
  /** Show the Moxy Hotels logo centered in the header. */
  showLogo?: boolean;
  /** Logo image src — defaults to white version. */
  logoSrc?: string;
}) {
  return (
    <main
      className={twMerge(
        "min-h-[100dvh] text-[var(--foreground)] [padding-bottom:env(safe-area-inset-bottom)]",
        mainClassName,
      )}
    >
      <div
        className={twMerge(
          "relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-5 py-5",
          containerClassName,
        )}
      >
        {showLogo && (
          <div className="absolute left-1/2 -translate-x-1/2 z-20" style={{ top: "max(4.77dvh, calc(env(safe-area-inset-top) + 8px))" }}>
            <Image
              src={logoSrc}
              alt="Moxy Hotels"
              width={146}
              height={58}
              className="h-auto w-[clamp(100px,32.5vw,146px)] object-contain"
              priority
            />
          </div>
        )}
        <header className="relative z-[1] mb-4 flex items-center justify-end">
          <LanguageSwitcher locale={locale} />
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </main>
  );
}
