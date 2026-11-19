import type { GlobalConfig } from "payload";
import { DEFAULT_MAKING_DAYS } from "@/lib/orders/fulfilment";
import { isAdmin } from "../access";

/** Shop-wide settings the owners edit. */
export const StoreSettings: GlobalConfig = {
  slug: "store-settings",
  label: { en: "Store settings", ar: "إعدادات المتجر" },
  admin: { group: { en: "Settings", ar: "الإعدادات" } },
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
      name: "customAbayaPriceAed",
      label: "Custom abaya price (AED)",
      type: "number",
      min: 0,
      admin: { step: 1, description: "The same, for customers shipping to the UAE." },
    },
    {
      name: "orderNotificationEmails",
      label: "Send new-order emails to",
      type: "array",
      fields: [{ name: "email", type: "email", required: true }],
    },
    {
      name: "defaultMakingDays",
      label: "Default making time (days)",
      type: "number",
      min: 1,
      max: 120,
      defaultValue: DEFAULT_MAKING_DAYS,
      admin: { step: 1, description: "For designs without their own making time, and custom abayas." },
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
