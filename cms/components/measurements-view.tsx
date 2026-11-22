"use client";

import { useAuth, useFormFields } from "@payloadcms/ui";
import { useState } from "react";
import {
  formatMeasurement,
  measurementKeys,
  otherUnit,
  unitOf,
  type Measurement,
  type StoredUnit,
  type Unit,
} from "@/lib/measurements";

const labels: Record<Measurement, string> = {
  length: "Length",
  shoulder: "Shoulder width",
  bust: "Bust",
  waist: "Waist",
  hips: "Hips",
  sleeve: "Sleeve length",
};

type View = "entered" | Unit;

/**
 * An order line's measurements for the workshop. The value the customer entered
 * is always shown and labelled; switching to the other unit shows a conversion
 * marked "≈", worked out here and never saved. Starts in the admin's preferred
 * unit (Users → "Show measurements in").
 */
export function MeasurementsView({ path }: { path: string }) {
  const prefix = path.slice(0, path.lastIndexOf(".") + 1);
  const { user } = useAuth<{ measurementUnit?: View | null }>();
  const [view, setView] = useState<View>(user?.measurementUnit ?? "entered");
  const set = useFormFields(([fields]) => {
    const value = (k: string) => fields[`${prefix}measurements.${k}`]?.value;
    return {
      unit: value("unit") as StoredUnit | undefined,
      values: Object.fromEntries(measurementKeys.map((m) => [m, value(m)])) as Record<Measurement, number | undefined>,
    };
  });

  return (
    <div style={{ marginBlock: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <strong style={{ fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase" }}>Measurements</strong>
        <div role="group" aria-label="Show measurements in" style={{ display: "inline-flex", border: "1px solid var(--theme-elevation-200)" }}>
          {(["entered", "in", "cm"] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              style={{
                border: 0,
                padding: "4px 12px",
                cursor: "pointer",
                fontSize: 12,
                background: view === v ? "var(--theme-elevation-800)" : "transparent",
                color: view === v ? "var(--theme-elevation-0)" : "inherit",
              }}
            >
              {v === "entered" ? "As entered" : v === "in" ? "Inches" : "Centimetres"}
            </button>
          ))}
        </div>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8, fontVariantNumeric: "tabular-nums" }}>
        <tbody>
          {measurementKeys.map((m) => {
            const value = set.values[m];
            if (typeof value !== "number") return null;
            const entered = unitOf(m, set.unit);
            const exact = formatMeasurement(m, value, entered, "en");
            const showExact = view === "entered" || view === entered;
            return (
              <tr key={m} style={{ borderBottom: "1px solid var(--theme-elevation-100)" }}>
                <td style={{ padding: "6px 0", color: "var(--theme-elevation-500)", width: "35%" }}>{labels[m]}</td>
                <td style={{ padding: "6px 8px" }}>
                  {showExact ? (
                    <>
                      <strong>{exact}</strong> <span style={{ fontSize: 11, color: "var(--theme-success-500)" }}>entered</span>
                    </>
                  ) : (
                    otherUnit(m, value, entered, "en")
                  )}
                </td>
                <td style={{ padding: "6px 0", color: "var(--theme-elevation-500)", textAlign: "end" }}>
                  {showExact ? otherUnit(m, value, entered, "en") : `${exact} entered`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
