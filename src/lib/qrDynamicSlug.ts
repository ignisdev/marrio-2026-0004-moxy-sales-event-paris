import type { BasePayload } from "payload";
import { nanoid } from "nanoid";

const qrDynamicSlugLength = 16;
const maxGenerationAttempts = 10;

export function buildQrDynamicUrl(slug: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  const normalizedAppUrl = appUrl.replace(/\/$/, "");

  return `${normalizedAppUrl}/q/${slug}`;
}

export function generateQrDynamicSlug() {
  return nanoid(qrDynamicSlugLength);
}

export async function generateUniqueQrDynamicSlug(payload: BasePayload) {
  for (let attempt = 0; attempt < maxGenerationAttempts; attempt += 1) {
    const slug = generateQrDynamicSlug();
    const existing = await payload.find({
      collection: "artworks",
      limit: 1,
      where: {
        qrDynamicSlug: {
          equals: slug,
        },
      },
    });

    if (existing.totalDocs === 0) {
      return slug;
    }
  }

  throw new Error("Could not generate a unique QR dynamic slug.");
}
