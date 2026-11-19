import type { CollectionConfig } from "payload";
import { isAdmin } from "../access";

/** Admin logins only. Customers check out as guests and have no accounts. */
export const Users: CollectionConfig = {
  slug: "users",
  admin: { useAsTitle: "email", group: "Settings" },
  auth: true,
  access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
  fields: [
    { name: "name", type: "text" },
    {
      name: "measurementUnit",
      label: "Show measurements in",
      type: "select",
      required: true,
      defaultValue: "entered",
      options: [
        { label: "As the customer entered them", value: "entered" },
        { label: "Inches", value: "in" },
        { label: "Centimetres", value: "cm" },
      ],
      admin: { description: "How orders show measurements to you. The customer's own numbers are always kept and labelled." },
    },
  ],
};
