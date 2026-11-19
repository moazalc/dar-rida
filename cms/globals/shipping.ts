import type { Field, GlobalConfig } from "payload";
import { shippingCountries } from "@/lib/shipping-countries";
import { isAdmin } from "../access";

const names = new Intl.DisplayNames(["en"], { type: "region" });
const countryOptions = shippingCountries
  .filter((c) => c !== "AE")
  .map((c) => ({ label: names.of(c) ?? c, value: c }))
  .sort((a, b) => a.label.localeCompare(b.label));

const deliveryDays: Field = {
  name: "deliveryDays",
  label: "Usual delivery (days)",
  type: "number",
  min: 1,
  max: 60,
  admin: { step: 1, description: "For the team only: after shipping, the dashboard expects delivery around then." },
};

function feeRow(currency: "AED" | "USD", what: string): Field {
  return {
    type: "row",
    fields: [
      {
        name: "fee",
        label: `Fee (${currency})`,
        type: "number",
        required: true,
        min: 0,
        defaultValue: 0,
        admin: { step: 1, description: `Per order${what}. 0 for free shipping.` },
      },
      {
        name: "freeOver",
        label: `Free over (${currency})`,
        type: "number",
        min: 0,
        admin: { step: 1, description: "Optional: shipping is free when the bag is worth at least this much." },
      },
    ],
  };
}

/**
 * Shipping fees. The UAE pays one flat fee in dirhams. Everywhere else pays in
 * dollars, by zone: the first zone that lists the country, or rest of world.
 * The customer sees the fee in the bag before checkout.
 */
export const Shipping: GlobalConfig = {
  slug: "shipping",
  label: { en: "Shipping", ar: "الشحن" },
  admin: { group: { en: "Settings", ar: "الإعدادات" } },
  access: { read: isAdmin, update: isAdmin },
  fields: [
    {
      name: "uae",
      label: "United Arab Emirates",
      type: "group",
      fields: [feeRow("AED", " within the UAE"), deliveryDays],
    },
    {
      name: "zones",
      label: "Zones (everywhere else)",
      type: "array",
      labels: { singular: "Zone", plural: "Zones" },
      admin: {
        description: "e.g. GCC, Europe, North America. A country belongs to one zone at most.",
        initCollapsed: true,
        components: { RowLabel: "/cms/components/zone-row-label#ZoneRowLabel" },
      },
      validate: (zones: unknown) => {
        const seen = new Map<string, string>();
        for (const zone of (zones as { name?: string; countries?: string[] }[] | null) ?? []) {
          for (const c of zone.countries ?? []) {
            const other = seen.get(c);
            if (other) return `${names.of(c) ?? c} is in both "${other}" and "${zone.name}". Keep it in one zone.`;
            seen.set(c, zone.name ?? "");
          }
        }
        return true;
      },
      fields: [
        { name: "name", type: "text", required: true, admin: { description: "Shown on the order, e.g. Europe" } },
        { name: "countries", type: "select", hasMany: true, required: true, options: countryOptions },
        feeRow("USD", " to these countries"),
        deliveryDays,
      ],
    },
    {
      name: "restOfWorld",
      label: "Rest of world",
      type: "group",
      admin: { description: "Any country that is not in a zone above." },
      fields: [feeRow("USD", ""), deliveryDays],
    },
  ],
};
