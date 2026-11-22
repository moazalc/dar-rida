import { describe, expect, it } from "vitest";
import {
  cleanNotes,
  convertToGrid,
  formatMeasurement,
  measurementKeys,
  NOTES_MAX,
  otherUnit,
  parseMeasurements,
  measurementRows,
  unitOf,
} from "@/lib/measurements";

const inches = { unit: "in", length: "56", shoulder: "15.5", bust: "36", waist: "30", hips: "40", sleeve: "23" };
const cms = { unit: "cm", length: "142", shoulder: "39", bust: "91", waist: "76", hips: "102", sleeve: "58" };

describe("parseMeasurements", () => {
  it("accepts a full set in inches and keeps the unit", () => {
    expect(parseMeasurements(inches)).toEqual({ unit: "in", length: 56, shoulder: 15.5, bust: 36, waist: 30, hips: 40, sleeve: 23 });
  });

  it("accepts a full set in centimetres, stored exactly as entered", () => {
    expect(parseMeasurements(cms)).toEqual({ unit: "cm", length: 142, shoulder: 39, bust: 91, waist: 76, hips: 102, sleeve: 58 });
  });

  it("checks each value against its own unit's list", () => {
    // 142 is a centimetre length, not an inch one; 15.5 cm is not on the centimetre grid.
    expect(parseMeasurements({ ...inches, length: "142" })).toBeNull();
    expect(parseMeasurements({ ...cms, shoulder: "15.5" })).toBeNull();
  });

  it("rejects a missing or unknown unit, including the legacy one", () => {
    expect(parseMeasurements({ ...inches, unit: undefined })).toBeNull();
    expect(parseMeasurements({ ...inches, unit: "mm" })).toBeNull();
    expect(parseMeasurements({ ...inches, unit: "legacy" })).toBeNull();
  });

  it("rejects a missing measurement or a value outside the list", () => {
    expect(parseMeasurements({ ...inches, hips: undefined })).toBeNull();
    expect(parseMeasurements({ ...inches, waist: undefined })).toBeNull();
    expect(parseMeasurements({ ...inches, waist: "23" })).toBeNull();
    expect(parseMeasurements({ ...inches, shoulder: "15.25" })).toBeNull();
    expect(parseMeasurements({ ...inches, bust: "" })).toBeNull();
    expect(parseMeasurements({ ...inches, bust: "36; drop table" })).toBeNull();
  });

  it("rejects things that are not objects", () => {
    expect(parseMeasurements(null)).toBeNull();
    expect(parseMeasurements("56")).toBeNull();
  });
});

describe("unitOf", () => {
  it("uses the set's unit for every measurement", () => {
    for (const m of measurementKeys) {
      expect(unitOf(m, "in")).toBe("in");
      expect(unitOf(m, "cm")).toBe("cm");
    }
  });

  it("reads orders from before units existed as inches", () => {
    expect(unitOf("length", "legacy")).toBe("in");
    expect(unitOf("bust", "legacy")).toBe("in");
  });
});

describe("formatMeasurement", () => {
  it("writes the value as stored, with its unit", () => {
    expect(formatMeasurement("bust", 36, "in", "en")).toBe("36 in");
    expect(formatMeasurement("shoulder", 15.5, "in", "en")).toBe("15.5 in");
    expect(formatMeasurement("bust", 91, "cm", "en")).toBe("91 cm");
  });

});

describe("otherUnit", () => {
  it("gives the display-only conversion, rounded to a tenth", () => {
    expect(otherUnit("bust", 36, "in", "en")).toBe("≈ 91.4 cm");
    expect(otherUnit("bust", 91, "cm", "en")).toBe("≈ 35.8 in");
  });

});

describe("convertToGrid", () => {
  it("moves a value to the nearest allowed value in the other unit", () => {
    expect(convertToGrid("bust", 36, "in", "cm")).toBe(91);
    expect(convertToGrid("shoulder", 39, "cm", "in")).toBe(15.5);
    expect(convertToGrid("waist", 76, "cm", "in")).toBe(30);
  });

  it("stays inside the allowed range", () => {
    expect(convertToGrid("length", 62, "in", "cm")).toBe(157);
    expect(convertToGrid("length", 127, "cm", "in")).toBe(50);
  });

  it("always lands on a value parseMeasurements accepts", () => {
    const converted: Record<string, unknown> = { unit: "cm" };
    for (const m of measurementKeys) converted[m] = convertToGrid(m, Number(inches[m]), "in", "cm");
    expect(parseMeasurements(converted)).not.toBeNull();
  });
});

describe("measurement list", () => {
  it("takes waist instead of height, top to bottom with sleeve last", () => {
    expect([...measurementKeys]).toEqual(["length", "shoulder", "bust", "waist", "hips", "sleeve"]);
  });
});

describe("measurementRows", () => {
  it("skips values an old order doesn't have (no waist before it replaced height)", () => {
    const rows = measurementRows({ unit: "legacy", length: 56, shoulder: 15, bust: 36, hips: 40, sleeve: 23 });
    expect(rows.map((r) => r.key)).toEqual(["length", "shoulder", "bust", "hips", "sleeve"]);
    expect(rows.every((r) => r.unit === "in")).toBe(true);
  });
});

describe("cleanNotes", () => {
  it("trims and caps notes, and ignores non-strings", () => {
    expect(cleanNotes("  hi  ")).toBe("hi");
    expect(cleanNotes("x".repeat(NOTES_MAX + 50))).toHaveLength(NOTES_MAX);
    expect(cleanNotes({ evil: true })).toBe("");
  });
});
