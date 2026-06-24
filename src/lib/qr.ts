const qrPayloadPattern = /^mgq:v1:([^:]+):([^:]+)$/;

export type ArtworkQrPayload = {
  eventSlug: string;
  qrToken: string;
};

export function buildArtworkQrPayload({
  eventSlug,
  qrToken,
}: ArtworkQrPayload): string {
  return `mgq:v1:${eventSlug}:${qrToken}`;
}

export function parseArtworkQrPayload(value: string): ArtworkQrPayload | null {
  const normalizedValue = value.trim();
  const match = normalizedValue.match(qrPayloadPattern);

  if (!match) {
    return null;
  }

  const [, eventSlug, qrToken] = match;

  if (!eventSlug || !qrToken) {
    return null;
  }

  return {
    eventSlug,
    qrToken,
  };
}

export function getDynamicQrSlug(value: string): string | null {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  try {
    const url = new URL(normalizedValue);
    const pathParts = url.pathname.split("/").filter(Boolean);

    if (pathParts[0] === "q" && pathParts[1]) {
      return pathParts[1];
    }

    return pathParts[pathParts.length - 1] || null;
  } catch {
    return normalizedValue;
  }
}

export function normalizeQrUrl(value: string): string {
  const normalizedValue = value.trim();

  try {
    const url = new URL(normalizedValue);
    url.hash = "";
    url.search = "";

    return url.toString().replace(/\/$/, "");
  } catch {
    return normalizedValue.replace(/\/$/, "");
  }
}
