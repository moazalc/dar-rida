import type { Field } from "payload";
import { measurementKeys } from "@/lib/measurements";

const labels: Record<(typeof measurementKeys)[number], string> = {
  height: "Height",
  length: "Length",
  shoulder: "Shoulder",
  bust: "Bust",
  sleeve: "Sleeve",
  hips: "Hips",
};

/**
 * The six measurements and the unit they were entered in, as one group. The
 * numbers are stored exactly as the customer confirmed them; nothing converts
 * them. On orders the raw group is hidden and `MeasurementsView` shows it with
 * the unit and a display-only conversion.
 */
export function measurementsField(readOnly = false): Field[] {
  const field = (m: (typeof measurementKeys)[number]): Field => ({
    name: m,
    label: labels[m],
    type: "number",
    required: true,
    admin: { readOnly },
  });
  const group: Field = {
    name: "measurements",
    type: "group",
    admin: { hidden: readOnly },
    fields: [
      {
        name: "unit",
        type: "select",
        required: true,
        defaultValue: "legacy",
        options: [
          { label: "Inches", value: "in" },
          { label: "Centimetres", value: "cm" },
          { label: "Inches, height in cm (before units)", value: "legacy" },
        ],
        admin: { readOnly, description: "The unit the customer entered these in. The numbers are exactly as entered." },
      },
      { type: "row", fields: measurementKeys.slice(0, 3).map(field) },
      { type: "row", fields: measurementKeys.slice(3).map(field) },
    ],
  };
  if (!readOnly) return [group];
  return [
    group,
    {
      name: "measurementsView",
      type: "ui",
      admin: { components: { Field: "/cms/components/measurements-view#MeasurementsView" } },
    },
  ];
}

/** "$1,240.00" or "AED 4,500.00" from minor units, in the order's own currency. */
export function formatOrderMoney(minor: number | null | undefined, currency: string | null | undefined): string {
  if (typeof minor !== "number") return "";
  const code = (currency || "usd").toUpperCase();
  return new Intl.NumberFormat("en-US", { style: "currency", currency: code, currencyDisplay: code === "USD" ? "symbol" : "code" }).format(
    minor / 100,
  );
}
