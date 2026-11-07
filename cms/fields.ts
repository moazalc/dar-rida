import type { Field } from "payload";
import { measurementKeys, measurementSpec } from "@/lib/measurements";

const labels: Record<(typeof measurementKeys)[number], string> = {
  length: "Length",
  bust: "Bust",
  shoulder: "Shoulder",
  sleeve: "Sleeve",
  hips: "Hips",
  height: "Height",
};

/** The six measurements as one labelled group, laid out in two rows for the workshop. */
export function measurementsField(readOnly = false): Field {
  const field = (m: (typeof measurementKeys)[number]): Field => ({
    name: m,
    label: `${labels[m]} (${measurementSpec[m].unit})`,
    type: "number",
    required: true,
    admin: { readOnly },
  });
  return {
    name: "measurements",
    type: "group",
    fields: [
      { type: "row", fields: measurementKeys.slice(0, 3).map(field) },
      { type: "row", fields: measurementKeys.slice(3).map(field) },
    ],
  };
}

/** "$1,240.00" from whole cents. */
export function formatUsd(cents: number | null | undefined): string {
  if (typeof cents !== "number") return "";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}
