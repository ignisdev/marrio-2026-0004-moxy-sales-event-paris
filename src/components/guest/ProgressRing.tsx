"use client";

import { useEffect, useState } from "react";

export function ProgressRing({
  collected,
  required,
}: {
  collected: number;
  required: number;
}) {
  const target = required > 0 ? Math.min(1, collected / required) : 0;
  const [progress, setProgress] = useState(0);

  // Animate the fill from empty up to the current level on mount.
  useEffect(() => {
    const id = requestAnimationFrame(() => setProgress(target));
    return () => cancelAnimationFrame(id);
  }, [target]);

  const size = 96;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative grid place-items-center" style={{ height: size, width: size }}>
      <svg className="-rotate-90" height={size} width={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke="var(--accent)"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth={stroke}
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.22, 0.61, 0.36, 1)",
          }}
        />
      </svg>
      <span className="absolute text-lg font-bold">
        {collected}/{required}
      </span>
    </div>
  );
}
