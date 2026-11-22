// The measurements every piece is made to. Shared by the product page, the
// bag, orders, emails and the admin, so there is one list and one check.
// Safe to import from server and client code.
//
// No drift: a set of measurements is stored exactly as the customer confirmed
// it, together with the unit they confirmed it in. Each unit has its own list
// of allowed values. The other unit is only ever worked out for display
// (marked "≈") and never saved. Switching units before saving moves each value
// to the nearest allowed value in the new unit, in front of the customer, who
// then checks them on the review screen.

export type Unit = "in" | "cm";
/** "legacy": orders from before units existed, all in inches. */
export type StoredUnit = Unit | "legacy";

export const units: readonly Unit[] = ["in", "cm"];
export const DEFAULT_UNIT: Unit = "in";
export const UNIT_COOKIE = "dr_unit";
export const CM_PER_INCH = 2.54;

/**
 * Shipping countries where people measure only in centimetres: inches would
 * just confuse, so the unit switch is hidden there and everything starts in cm.
 */
export const METRIC_ONLY_COUNTRIES: readonly string[] = ["LY"];

export function isMetricOnly(country: string | null | undefined): boolean {
  return Boolean(country) && METRIC_ONLY_COUNTRIES.includes(country!);
}

export function isUnit(value: unknown): value is Unit {
  return value === "in" || value === "cm";
}

function range(from: number, to: number, step: number): number[] {
  const values: number[] = [];
  for (let v = from; v <= to + 1e-9; v += step) values.push(Math.round(v * 10) / 10);
  return values;
}

/** In the order they are taken, top to bottom, sleeve last. */
export const measurementKeys = ["length", "shoulder", "bust", "waist", "hips", "sleeve"] as const;
export type Measurement = (typeof measurementKeys)[number];

/** The allowed values for each measurement, per unit, over the same span of the body. */
export const measurementGrid: Record<Unit, Record<Measurement, readonly number[]>> = {
  in: {
    length: range(50, 62, 1),
    shoulder: range(13, 19, 0.5),
    bust: range(30, 52, 1),
    waist: range(24, 46, 1),
    hips: range(34, 58, 1),
    sleeve: range(20, 27, 0.5),
  },
  cm: {
    length: range(127, 157, 1),
    shoulder: range(33, 48, 1),
    bust: range(76, 132, 1),
    waist: range(61, 117, 1),
    hips: range(86, 147, 1),
    sleeve: range(51, 69, 1),
  },
};

/** A confirmed set, as stored on a bag line or an order. */
export type Measurements = { unit: Unit } & Record<Measurement, number>;
/**
 * As read back from the database: older orders carry no unit ("legacy") and
 * no waist (it replaced height), so any value may be missing.
 */
export type StoredMeasurements = { unit: StoredUnit } & Partial<Record<Measurement, number | null>>;
/** As held while the customer is still choosing. */
export type MeasurementsDraft = { unit: Unit } & Partial<Record<Measurement, number>>;

/** The unit one measurement of a stored set is in. */
export function unitOf(_m: Measurement, unit: StoredUnit | null | undefined): Unit {
  return unit === "cm" ? "cm" : "in";
}

function toNumber(value: unknown): number {
  return typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
}

/**
 * Check untrusted input (a Server Action argument) and return clean numbers,
 * or null if the unit is unknown, or any measurement is missing or not one of
 * the allowed values for that unit.
 */
export function parseMeasurements(input: unknown): Measurements | null {
  if (typeof input !== "object" || input === null) return null;
  const raw = input as Record<string, unknown>;
  if (!isUnit(raw.unit)) return null;
  const out = { unit: raw.unit } as Measurements;
  for (const m of measurementKeys) {
    const n = toNumber(raw[m]);
    if (!measurementGrid[raw.unit][m].includes(n)) return null;
    out[m] = n;
  }
  return out;
}

export function isComplete(draft: MeasurementsDraft): draft is Measurements {
  return parseMeasurements(draft) !== null;
}

/** "36 in" or "91 cm". Writes the value exactly as given. */
export function formatMeasurement(
  m: Measurement,
  value: number,
  unit: Unit,
  locale: string,
  labels: Record<Unit, string> = { in: "in", cm: "cm" },
): string {
  return `${value.toLocaleString(locale)} ${labels[unit]}`;
}

/** The same value in the other unit, for display only: "≈ 91.4 cm". */
export function otherUnit(
  m: Measurement,
  value: number,
  unit: Unit,
  locale: string,
  labels: Record<Unit, string> = { in: "in", cm: "cm" },
): string {
  const to: Unit = unit === "in" ? "cm" : "in";
  const exact = unit === "in" ? value * CM_PER_INCH : value / CM_PER_INCH;
  return `≈ ${(Math.round(exact * 10) / 10).toLocaleString(locale)} ${labels[to]}`;
}

/** The allowed value in `to` nearest to `value` in `from`. Only used when the customer switches units. */
export function convertToGrid(m: Measurement, value: number, from: Unit, to: Unit): number {
  if (from === to) return value;
  const target = from === "in" ? value * CM_PER_INCH : value / CM_PER_INCH;
  return measurementGrid[to][m].reduce((best, v) => (Math.abs(v - target) < Math.abs(best - target) ? v : best));
}

/** Each measurement of a stored set with the unit it is in, for the bag, emails and the admin. Missing values are left out. */
export function measurementRows(set: StoredMeasurements): { key: Measurement; value: number; unit: Unit }[] {
  return measurementKeys.flatMap((key) => {
    const value = set[key];
    return typeof value === "number" ? [{ key, value, unit: unitOf(key, set.unit) }] : [];
  });
}

export const NOTES_MAX = 500;

/** Trim and cap free-text notes from untrusted input. */
export function cleanNotes(input: unknown): string {
  return typeof input === "string" ? input.trim().slice(0, NOTES_MAX) : "";
}
