import type { CollectionConfig } from "payload";
import { isAdmin } from "../access";

/** The Rida collection: fixed designs, each made to the customer's measurements. */
export const Designs: CollectionConfig = {
  slug: "designs",
  admin: {
    group: "Shop",
    useAsTitle: "code",
    defaultColumns: ["code", "name", "price", "active", "sortOrder"],
    description: "The Rida collection. Each design is made to the customer's own measurements.",
  },
  defaultSort: "sortOrder",
  access: {
    // The public may only see designs that are switched on.
    read: ({ req }) => (req.user ? true : { active: { equals: true } }),
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "code", type: "text", required: true, admin: { description: 'e.g. "RIDA 01"' } },
        {
          name: "slug",
          type: "text",
          required: true,
          unique: true,
          index: true,
          admin: { description: "Used in the address: /collection/<slug>" },
          validate: (value: unknown) =>
            typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
              ? true
              : "Lowercase letters, numbers and dashes only",
        },
      ],
    },
    { name: "name", type: "text", required: true, localized: true },
    { name: "description", type: "textarea", required: true, localized: true },
    { name: "cut", type: "text", localized: true, admin: { description: "The short line about the cut" } },
    {
      type: "row",
      fields: [
        {
          name: "price",
          label: "Price (USD)",
          type: "number",
          required: true,
          min: 0,
          admin: { step: 1, description: "In US dollars. Stripe shows customers their own currency at checkout." },
        },
        { name: "leadTime", type: "text", localized: true, admin: { description: 'e.g. "Ready in 3 weeks"' } },
      ],
    },
    {
      name: "images",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      admin: { description: "Photos. Without any, the line drawing is shown." },
    },
    {
      name: "drawing",
      type: "select",
      required: true,
      options: [
        { label: "Rida 01", value: "rida-01" },
        { label: "Rida 02", value: "rida-02" },
        { label: "Rida 03", value: "rida-03" },
        { label: "Rida 04", value: "rida-04" },
      ],
      admin: { description: "The line drawing shown when there are no photos" },
    },
    {
      type: "row",
      fields: [
        { name: "active", type: "checkbox", defaultValue: true, admin: { description: "Untick to hide it from the shop" } },
        { name: "sortOrder", type: "number", defaultValue: 0 },
      ],
    },
  ],
};
