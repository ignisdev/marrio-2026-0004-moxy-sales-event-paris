import type { CollectionConfig } from "payload";

const localizedTextarea = (name: string, label: string) =>
  ({
    name,
    type: "textarea",
    label,
    localized: true,
  }) as const;

export const Events: CollectionConfig = {
  slug: "events",
  admin: {
    defaultColumns: ["title", "slug", "eventDate", "status"],
    useAsTitle: "title",
  },
  fields: [
    { name: "title", type: "text", localized: true, required: true },
    { name: "slug", type: "text", index: true, required: true, unique: true },
    { name: "venueName", type: "text", localized: true, required: true },
    { name: "city", type: "text", localized: true, required: true },
    { name: "eventDate", type: "date", required: true },
    {
      name: "status",
      type: "select",
      defaultValue: "draft",
      options: ["draft", "active", "closed"],
      required: true,
    },
    {
      name: "defaultLocale",
      type: "select",
      defaultValue: "en",
      options: ["en", "fr"],
      required: true,
    },
    {
      name: "supportedLocales",
      type: "array",
      fields: [{ name: "locale", type: "select", options: ["en", "fr"] }],
    },
    localizedTextarea("introCopy", "Intro copy"),
    localizedTextarea("instructionsCopy", "Instructions copy"),
    localizedTextarea("completionCopy", "Completion copy"),
    localizedTextarea("prizeCopy", "Prize copy"),
    localizedTextarea("bonvoyCopy", "Bonvoy copy"),
    {
      name: "totalRequiredArtworks",
      type: "number",
      defaultValue: 5,
      min: 1,
      required: true,
    },
    {
      name: "publicProgressEnabled",
      type: "checkbox",
      defaultValue: true,
    },
  ],
};
