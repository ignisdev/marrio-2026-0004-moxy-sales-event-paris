import type { CollectionConfig } from "payload";

export const Participants: CollectionConfig = {
  slug: "participants",
  admin: {
    defaultColumns: ["displayName", "uid", "lastActiveAt", "completedAt"],
    useAsTitle: "displayName",
  },
  hooks: {
    // Postgres FKs from scan-events/reward-entries to participants are
    // ON DELETE SET NULL, but "participant" is a required field on both —
    // deleting a participant without clearing its dependents first trips the
    // NOT NULL constraint. Payload doesn't cascade automatically, so do it here.
    beforeDelete: [
      async ({ req, id }) => {
        await req.payload.delete({
          collection: "scan-events",
          req,
          where: { participant: { equals: id } },
        });
        await req.payload.delete({
          collection: "reward-entries",
          req,
          where: { participant: { equals: id } },
        });
      },
    ],
  },
  fields: [
    { name: "uid", type: "text", index: true, required: true, unique: true },
    { name: "event", type: "relationship", relationTo: "events", required: true },
    // Registration now captures a single name only (stored in firstName and
    // mirrored to displayName); lastName is retained but optional.
    { name: "firstName", type: "text", required: true },
    { name: "lastName", type: "text" },
    { name: "displayName", type: "text", required: true },
    // Email is no longer collected at registration. The (optional) field is
    // retained so the email-based returning-visitor login still resolves any
    // records that already have one.
    { name: "email", type: "email" },
    { name: "company", type: "text" },
    { name: "preferredLocale", type: "select", defaultValue: "en", options: ["en", "fr"] },
    { name: "isBonvoyMember", type: "checkbox", defaultValue: false },
    { name: "marketingConsent", type: "checkbox", defaultValue: false },
    { name: "termsAccepted", type: "checkbox", required: true },
    { name: "registeredAt", type: "date", required: true },
    { name: "lastActiveAt", type: "date" },
    { name: "completedAt", type: "date" },
  ],
};
