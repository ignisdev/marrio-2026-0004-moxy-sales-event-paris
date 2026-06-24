import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

// Derive the dev origin allowlist from NEXT_PUBLIC_APP_URL so the tunnel URL
// only has to be set in one place (.env.local). Add any extra LAN/dev origins
// via NEXT_PUBLIC_EXTRA_DEV_ORIGINS (comma-separated host[:port] values).
function getAllowedDevOrigins(): string[] {
  const origins = new Set<string>();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (appUrl) {
    try {
      origins.add(new URL(appUrl).host);
    } catch {
      // Ignore malformed NEXT_PUBLIC_APP_URL values.
    }
  }

  for (const extra of (process.env.NEXT_PUBLIC_EXTRA_DEV_ORIGINS ?? "").split(",")) {
    const trimmed = extra.trim();
    if (trimmed) origins.add(trimmed);
  }

  return [...origins];
}

const nextConfig: NextConfig = {
  allowedDevOrigins: getAllowedDevOrigins(),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
    ],
  },
};

export default withPayload(nextConfig);
