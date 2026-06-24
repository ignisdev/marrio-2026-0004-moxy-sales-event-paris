import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    useAsTitle: "alt",
  },
  upload: true,
  fields: [
    {
      name: "alt",
      type: "text",
      localized: true,
      required: true,
    },
    {
      name: "caption",
      type: "textarea",
      localized: true,
    },
    {
      name: "assetType",
      type: "select",
      defaultValue: "image",
      options: ["image", "video", "poster", "fallback"],
      required: true,
    },
    {
      name: "event",
      type: "relationship",
      relationTo: "events",
    },
    {
      name: "artwork",
      type: "relationship",
      relationTo: "artworks",
    },
  ],
};
