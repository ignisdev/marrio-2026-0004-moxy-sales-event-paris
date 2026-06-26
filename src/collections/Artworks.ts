import type { CollectionConfig } from "payload";
import { nanoid } from "nanoid";

import { buildQrDynamicUrl, generateUniqueQrDynamicSlug } from "../lib/qrDynamicSlug.ts";

export const Artworks: CollectionConfig = {
  slug: "artworks",
  admin: {
    defaultColumns: ["title", "event", "qrLabel", "displayOrder", "isActive"],
    useAsTitle: "title",
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        const slug = data.qrDynamicSlug || originalDoc?.qrDynamicSlug;
        if (typeof slug === "string" && slug.trim()) {
          data.qrDynamicUrl = buildQrDynamicUrl(slug.trim());
        }

        return data;
      },
    ],
  },
  fields: [
    { name: "title", type: "text", localized: true, required: true },
    { name: "slug", type: "text", index: true, required: true, unique: true },
    { name: "event", type: "relationship", relationTo: "events", required: true },
    { name: "theme", type: "text", localized: true },
    { name: "locationLabel", type: "text", localized: true },
    { name: "displayOrder", type: "number", defaultValue: 0, required: true },
    { name: "clueText", type: "textarea", localized: true },
    { name: "brandStory", type: "textarea", localized: true },
    { name: "completionMessage", type: "textarea", localized: true },
    { name: "lockedImage", type: "upload", relationTo: "media" },
    { name: "revealedImage", type: "upload", relationTo: "media" },
    { name: "videoAsset", type: "upload", relationTo: "media", localized: true },
    { name: "posterImage", type: "upload", relationTo: "media", localized: true },
    { name: "isActive", type: "checkbox", defaultValue: true },
    { name: "isBonvoyBonus", type: "checkbox", defaultValue: false },
    {
      name: "qrPath",
      type: "text",
      admin: {
        description:
          "Legacy URL-style QR path. Do not use for new artwork QR codes.",
      },
    },
    {
      name: "qrToken",
      type: "text",
      defaultValue: () => nanoid(16),
      index: true,
      required: true,
      unique: true,
      admin: {
        description:
          "Opaque artwork QR token. Printed QR payload should be mgq:v1:{eventSlug}:{qrToken}.",
      },
    },
    { name: "qrLabel", type: "text" },
    { name: "qrIsActive", type: "checkbox", defaultValue: true },
    {
      name: "qrDynamicSlug",
      type: "text",
      index: true,
      unique: true,
      hooks: {
        beforeValidate: [
          async ({ operation, originalDoc, req, value }) => {
            if (typeof value === "string" && value.trim()) {
              return value.trim();
            }

            if (
              operation === "update" &&
              typeof originalDoc?.qrDynamicSlug === "string" &&
              originalDoc.qrDynamicSlug.trim()
            ) {
              return originalDoc.qrDynamicSlug.trim();
            }

            return generateUniqueQrDynamicSlug(req.payload);
          },
        ],
      },
      admin: {
        components: {
          Field: "@/components/admin/GenerateQrDynamicSlugButton#GenerateQrDynamicSlugButton",
        },
        description:
          "First-party dynamic QR slug. Printed URL can be /q/{slug}.",
      },
    },
    {
      name: "qrDynamicUrl",
      type: "text",
      admin: {
        readOnly: true,
        description:
          "Full first-party dynamic URL printed in the QR code. Dynamically generated from NEXT_PUBLIC_APP_URL.",
      },
      hooks: {
        afterRead: [
          ({ data, value }) => {
            // In afterRead, `data` is the full document being read.
            if (data?.qrDynamicSlug) {
              return buildQrDynamicUrl(data.qrDynamicSlug);
            }
            return value;
          },
        ],
      },
    },
    {
      name: "qrDynamicDestination",
      type: "text",
      admin: {
        description:
          "Internal destination payload. Example: mgq:v1:moxy-paris-la-villette-2026:{qrToken}. Can be changed after printing.",
      },
    },
    {
      name: "qrExternalUrls",
      type: "array",
      fields: [{ name: "url", type: "text", required: true }],
      admin: {
        description:
          "External/short URLs printed in this artwork's QR code (e.g. https://rebrand.ly/xxxxxxx). The in-app scanner can't follow these redirects offline, so paste the EXACT URL encoded in the printed QR here and it will be mapped to this artwork locally.",
      },
    },
    {
      name: "qrCodePreview",
      type: "ui",
      admin: {
        components: {
          Field: "@/components/admin/QrCodePreview#QrCodePreview",
        },
      },
    },
  ],
};
