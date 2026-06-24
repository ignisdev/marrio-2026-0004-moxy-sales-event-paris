import type { CollectionConfig } from "payload";

export const AdminUsers: CollectionConfig = {
  slug: "admin-users",
  auth: true,
  admin: {
    useAsTitle: "email",
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
  ],
};
