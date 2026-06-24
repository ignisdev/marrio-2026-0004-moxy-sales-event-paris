import type { CollectionConfig } from "payload";

export const RewardEntries: CollectionConfig = {
  slug: "reward-entries",
  admin: {
    defaultColumns: ["participant", "isComplete", "completedAt", "rewardClaimed"],
  },
  fields: [
    { name: "event", type: "relationship", relationTo: "events", required: true },
    { name: "participant", type: "relationship", relationTo: "participants", required: true },
    { name: "isComplete", type: "checkbox", defaultValue: false },
    { name: "completedAt", type: "date" },
    { name: "standardRewardEligible", type: "checkbox", defaultValue: false },
    { name: "bonvoyRewardEligible", type: "checkbox", defaultValue: false },
    { name: "prizeDrawEntries", type: "number", defaultValue: 0, min: 0 },
    { name: "rewardClaimed", type: "checkbox", defaultValue: false },
    { name: "claimedAt", type: "date" },
    { name: "staffNotes", type: "textarea" },
  ],
};
