import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

// Generic guest button: purple pill, full radius, white Knockout text, ~120px
// wide (grows for longer labels), 1.2em. Used for Play / Register / Submit and
// all other primary guest actions.
const baseClass =
  "inline-flex h-12 min-w-[120px] mx-auto items-center justify-center rounded-full bg-[#8c0980] px-6 text-[1em] font-normal uppercase text-white font-[family-name:var(--font-title)] transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#8c0980]/50 focus:ring-offset-2 focus:ring-offset-[var(--background)]";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
};

export function Button({ className, children, ...props }: ButtonProps) {
  return (
    <button
      className={twMerge(baseClass, className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({ className, children, ...props }: LinkButtonProps) {
  return (
    <a
      className={twMerge(baseClass, className)}
      {...props}
    >
      {children}
    </a>
  );
}
