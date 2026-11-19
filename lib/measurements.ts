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
/** "legacy": orders from before units existed, with lengths in inches and height in centimetres. */
export type StoredUnit = Unit | "legacy";

export const units: readonly Unit[] = ["in", "cm"];
export const DEFAULT_UNIT: Unit = "in";
export const UNIT_COOKIE = "dr_unit";
export const CM_PER_INCH = 2.54;

export function isUnit(value: unknown): value is Unit {
  return value === "in" || value === "cm";
}

function range(from: number, to: number, step: number): number[] {
  const values: number[] = [];
  for (let v = from; v <= to + 1e-9; v += step) values.push(Math.round(v * 10) / 10);
  return values;
}

/** In the order they are taken: height first, so length can be suggested from it. */
export const measurementKeys = ["height", "length", "shoulder", "bust", "sleeve", "hips"] as const;
export type Measurement = (typeof measurementKeys)[number];

/** The allowed values for each measurement, per unit, over the same span of the body. */
export const measurementGrid: Record<Unit, Record<Measurement, readonly number[]>> = {
  in: {
    height: range(57, 75, 1),
    length: range(50, 62, 1),
    shoulder: range(13, 19, 0.5),
    bust: range(30, 52, 1),
    sleeve: range(20, 27, 0.5),
    hips: range(34, 58, 1),
  },
  cm: {
    height: range(145, 190, 1),
    length: range(127, 157, 1),
    shoulder: range(33, 48, 1),
    bust: range(76, 132, 1),
    sleeve: range(51, 69, 1),
    hips: range(86, 147, 1),
  },
};

/** A confirmed set, as stored on a bag line or an order. */
export type Measurements = { unit: Unit } & Record<Measurement, number>;
/** As read back from the database, where older orders carry no unit (or "legacy"). */
export type StoredMeasurements = { unit: StoredUnit } & Record<Measurement, number>;
/** As held while the customer is still choosing. */
export type MeasurementsDraft = { unit: Unit } & Partial<Record<Measurement, number>>;

/** The unit one measurement of a stored set is in. */
export function unitOf(m: Measurement, unit: StoredUnit | null | undefined): Unit {
  if (unit === "in" || unit === "cm") return unit;
  return m === "height" ? "cm" : "in";
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

const feetAndInches = (inches: number) => `${Math.floor(inches / 12)}′${inches % 12}″`;

/** "36 in", "91 cm", or "5′5″" for a height in inches. Writes the value exactly as given. */
export function formatMeasurement(
  m: Measurement,
  value: number,
  unit: Unit,
  locale: string,
  labels: Record<Unit, string> = { in: "in", cm: "cm" },
): string {
  if (m === "height" && unit === "in") return feetAndInches(value);
  return `${value.toLocaleString(locale)} ${labels[unit]}`;
}

/** The same value in the other unit, for display only: "≈ 91.4 cm", "≈ 5′5″". */
export function otherUnit(
  m: Measurement,
  value: number,
  unit: Unit,
  locale: string,
  labels: Record<Unit, string> = { in: "in", cm: "cm" },
): string {
  const to: Unit = unit === "in" ? "cm" : "in";
  const exact = unit === "in" ? value * CM_PER_INCH : value / CM_PER_INCH;
  if (m === "height") return `≈ ${formatMeasurement(m, Math.round(exact), to, locale, labels)}`;
  return `≈ ${(Math.round(exact * 10) / 10).toLocaleString(locale)} ${labels[to]}`;
}

/** The allowed value in `to` nearest to `value` in `from`. Only used when the customer switches units. */
export function convertToGrid(m: Measurement, value: number, from: Unit, to: Unit): number {
  if (from === to) return value;
  const target = from === "in" ? value * CM_PER_INCH : value / CM_PER_INCH;
  return measurementGrid[to][m].reduce((best, v) => (Math.abs(v - target) < Math.abs(best - target) ? v : best));
}

/** Suggested abaya length (inches) for a height in centimetres, for those unsure how to measure it. */
function lengthForHeightCm(cm: number): [number, number] {
  if (cm < 155) return [52, 53];
  if (cm < 160) return [54, 55];
  if (cm < 165) return [56, 57];
  if (cm < 170) return [58, 59];
  if (cm < 175) return [60, 61];
  return [62, 62];
}

/** The usual length range for a height, both in the same unit, as allowed values. */
export function suggestedLength(height: number, unit: Unit): [number, number] {
  const [a, b] = lengthForHeightCm(unit === "cm" ? height : height * CM_PER_INCH);
  return unit === "in" ? [a, b] : [convertToGrid("length", a, "in", "cm"), convertToGrid("length", b, "in", "cm")];
}

/** Each measurement of a stored set with the unit it is in, for the bag, emails and the admin. */
export function measurementRows(set: StoredMeasurements): { key: Measurement; value: number; unit: Unit }[] {
  return measurementKeys.map((key) => ({ key, value: set[key], unit: unitOf(key, set.unit) }));
}

export const NOTES_MAX = 500;

/** Trim and cap free-text notes from untrusted input. */
export function cleanNotes(input: unknown): string {
  return typeof input === "string" ? input.trim().slice(0, NOTES_MAX) : "";
}
