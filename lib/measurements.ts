// The measurements every piece is made to. Shared by the collection page, the
// builder, the bag, orders and the admin, so there is one list and one check.
// Lengths are in inches, as abayas are measured in the Gulf; height is in cm.
// Safe to import from server and client code.

function range(from: number, to: number, step: number): number[] {
  const values: number[] = [];
  for (let v = from; v <= to + 1e-9; v += step) values.push(Math.round(v * 10) / 10);
  return values;
}

export const measurementSpec = {
  length: { unit: "in", values: range(50, 62, 1) },
  bust: { unit: "in", values: range(30, 52, 1) },
  shoulder: { unit: "in", values: range(13, 19, 0.5) },
  sleeve: { unit: "in", values: range(20, 27, 0.5) },
  hips: { unit: "in", values: range(34, 58, 1) },
  height: { unit: "cm", values: range(145, 190, 1) },
} as const;

export type Measurement = keyof typeof measurementSpec;
export const measurementKeys = Object.keys(measurementSpec) as Measurement[];

/** As held in a form: each value is the chosen option's text, or "" before one is picked. */
export type MeasurementsInput = Record<Measurement, string>;
/** As stored on a bag line or an order. */
export type Measurements = Record<Measurement, number>;

export const emptyMeasurements: MeasurementsInput = {
  length: "",
  bust: "",
  shoulder: "",
  sleeve: "",
  hips: "",
  height: "",
};

/** Suggested abaya length (inches) from height (cm), for those who cannot measure. */
export const lengthByHeight: { height: string; length: string }[] = [
  { height: "< 155", length: "52–53" },
  { height: "155–160", length: "54–55" },
  { height: "160–165", length: "56–57" },
  { height: "165–170", length: "58–59" },
  { height: "170–175", length: "60–61" },
  { height: "175 +", length: "62" },
];

function allowed(m: Measurement, value: unknown): number | null {
  const n = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
  return (measurementSpec[m].values as readonly number[]).includes(n) ? n : null;
}

/**
 * Check untrusted input (a form, a Server Action argument) and return clean
 * numbers, or null if any measurement is missing or not one of the allowed values.
 */
export function parseMeasurements(input: unknown): Measurements | null {
  if (typeof input !== "object" || input === null) return null;
  const out = {} as Measurements;
  for (const m of measurementKeys) {
    const n = allowed(m, (input as Record<string, unknown>)[m]);
    if (n === null) return null;
    out[m] = n;
  }
  return out;
}

export function isMeasurementsComplete(input: MeasurementsInput): boolean {
  return parseMeasurements(input) !== null;
}

export const NOTES_MAX = 500;

/** Trim and cap free-text notes from untrusted input. */
export function cleanNotes(input: unknown): string {
  return typeof input === "string" ? input.trim().slice(0, NOTES_MAX) : "";
}
