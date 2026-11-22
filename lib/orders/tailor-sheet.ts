// What the printed tailor sheet shows for one piece. Pure, so it is tested
// without rendering (tests/tailor-sheet.test.ts).

import type { AdminLang } from "@/cms/admin/i18n";
import { MEASUREMENT_LABEL, UNIT_LABEL } from "@/lib/orders/export";
import { formatMeasurement, measurementKeys, otherUnit, unitOf, type Measurement, type StoredUnit, type Unit } from "@/lib/measurements";

export type SheetMeasurement = {
  key: Measurement;
  label: string;
  /** The value in centimetres and in inches; one of them is exactly what the customer entered. */
  cm: string;
  in: string;
  /** Which column is the customer's own value (the other is a conversion, marked "≈"). */
  exact: Unit;
};

const locale = (lang: AdminLang) => (lang === "ar" ? "ar-AE-u-nu-latn" : "en-GB");

/** Each measurement in both units, the entered one exact and the other marked "≈". Missing values are skipped. */
export function sheetMeasurements(
  set: ({ unit?: StoredUnit | null } & Partial<Record<Measurement, number | null>>) | null | undefined,
  lang: AdminLang,
): SheetMeasurement[] {
  if (!set) return [];
  const labels = { in: UNIT_LABEL.in[lang], cm: UNIT_LABEL.cm[lang] };
  const rows: SheetMeasurement[] = [];
  for (const key of measurementKeys) {
    const value = set[key];
    if (typeof value !== "number") continue;
    const entered = unitOf(key, set.unit);
    const exact = formatMeasurement(key, value, entered, locale(lang), labels);
    const converted = otherUnit(key, value, entered, locale(lang), labels);
    rows.push({
      key,
      label: MEASUREMENT_LABEL[key][lang],
      cm: entered === "cm" ? exact : converted,
      in: entered === "in" ? exact : converted,
      exact: entered,
    });
  }
  return rows;
}
