import type { CollectionConfig } from "payload";
import { isAdmin } from "../access";

/** Admin logins only. Customers check out as guests and have no accounts. */
export const Users: CollectionConfig = {
  slug: "users",
  admin: { useAsTitle: "email", group: "Settings" },
  auth: true,
  access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
  fields: [{ name: "name", type: "text" }],
};
