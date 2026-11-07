import type { CollectionConfig } from "payload";
import { isAdmin } from "../access";
import { measurementsField } from "../fields";

/**
 * Shopping bags, kept on the server and found by the random token in the
 * customer's `dr_cart` cookie. Prices are never stored here: they are worked
 * out from the designs and store settings each time, so a price change applies
 * at once. Hidden from the admin menu; the owners manage orders, not bags.
 */
export const Carts: CollectionConfig = {
  slug: "carts",
  admin: { hidden: true },
  access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
  fields: [
    { name: "token", type: "text", required: true, unique: true, index: true },
    {
      name: "lines",
      type: "array",
      fields: [
        {
          name: "kind",
          type: "select",
          required: true,
          options: [
            { label: "Collection design", value: "design" },
            { label: "Custom abaya", value: "custom" },
          ],
        },
        { name: "design", type: "relationship", relationTo: "designs" },
        { name: "config", type: "json" },
        measurementsField(),
        { name: "notes", type: "textarea" },
        { name: "quantity", type: "number", required: true, min: 1, max: 10, defaultValue: 1 },
      ],
    },
    // The checkout this bag last started, so starting a new one can close the old.
    { name: "pendingOrder", type: "relationship", relationTo: "orders" },
  ],
};
