import type { CollectionConfig } from "payload";

export const ScanEvents: CollectionConfig = {
  slug: "scan-events",
  admin: {
    defaultColumns: ["participant", "artwork", "scannedAt", "isFirstScanForArtwork"],
  },
  fields: [
    { name: "event", type: "relationship", relationTo: "events", required: true },
    { name: "participant", type: "relationship", relationTo: "participants", required: true },
    { name: "artwork", type: "relationship", relationTo: "artworks", required: true },
    { name: "scannedAt", type: "date", required: true },
    { name: "locale", type: "select", defaultValue: "en", options: ["en", "fr"] },
    { name: "userAgent", type: "text" },
    { name: "ipHash", type: "text" },
    {
      name: "source",
      type: "select",
      defaultValue: "qr",
      options: ["qr", "manual", "staff_test"],
      required: true,
    },
    { name: "isFirstScanForArtwork", type: "checkbox", defaultValue: true },
  ],
};
