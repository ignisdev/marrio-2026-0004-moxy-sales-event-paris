import type { HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(
        "rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
