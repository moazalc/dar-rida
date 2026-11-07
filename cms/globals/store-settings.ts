import type { GlobalConfig } from "payload";
import { isAdmin } from "../access";

/** Shop-wide settings the owners edit. */
export const StoreSettings: GlobalConfig = {
  slug: "store-settings",
  label: "Store settings",
  admin: { group: "Settings" },
  access: { read: isAdmin, update: isAdmin },
  fields: [
    {
      name: "customAbayaPrice",
      label: "Custom abaya price (USD)",
      type: "number",
      required: true,
      min: 0,
      defaultValue: 0,
      admin: { step: 1, description: "The price of an abaya from Design your own. Option extras come later." },
    },
    {
      name: "orderNotificationEmails",
      label: "Send new-order emails to",
      type: "array",
      fields: [{ name: "email", type: "email", required: true }],
    },
    {
      name: "defaultLeadTime",
      label: "Default lead time",
      type: "text",
      localized: true,
      admin: { description: 'Shown when a design has none of its own, e.g. "Ready in 3–4 weeks"' },
    },
  ],
};
