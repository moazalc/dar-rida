import type { CollectionConfig } from "payload";
import { isAdmin } from "../access";

/** The Rida collection: fixed designs, each made to the customer's measurements. */
export const Designs: CollectionConfig = {
  slug: "designs",
  labels: { singular: { en: "Design", ar: "تصميم" }, plural: { en: "Designs", ar: "التصاميم" } },
  admin: {
    group: { en: "Shop", ar: "المتجر" },
    useAsTitle: "code",
    defaultColumns: ["code", "name", "price", "priceAed", "active", "sortOrder"],
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
          admin: { step: 1, description: "For everywhere except the UAE. Stripe shows customers their own currency at checkout." },
        },
        {
          name: "priceAed",
          label: "Price (AED)",
          type: "number",
          min: 0,
          admin: { step: 1, description: "For customers shipping to the UAE. Leave empty and the piece shows as not available in the UAE yet." },
        },
        { name: "leadTime", type: "text", localized: true, admin: { description: 'e.g. "Ready in 3 weeks"' } },
      ],
    },
    {
      name: "makingDays",
      label: "Making time (days)",
      type: "number",
      min: 1,
      max: 120,
      admin: {
        step: 1,
        description: "For the team only: how many days this piece usually takes to make. Sets an order's ready-by date. Empty uses the store default.",
      },
    },
    {
      type: "collapsible",
      label: "Composition, care and origin",
      admin: { description: "Shown as the folding sections under the description. Leave one empty to hide it." },
      fields: [
        { name: "composition", type: "textarea", localized: true, admin: { description: 'e.g. "100% Japanese crepe, 220 g/m². Lining: viscose satin."' } },
        { name: "care", type: "textarea", localized: true, admin: { description: 'e.g. "Dry clean, or hand wash cold."' } },
        { name: "origin", type: "textarea", localized: true, admin: { description: 'e.g. "Cut and sewn to your measurements in our atelier in Dubai."' } },
      ],
    },
    {
      name: "completeTheLook",
      label: "Complete your look",
      type: "relationship",
      relationTo: "designs",
      hasMany: true,
      maxRows: 4,
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
      admin: { description: "Up to four pieces shown under this one. Empty: other pieces from the collection." },
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
