import { describe, expect, it } from "vitest";
import {
  cleanNotes,
  convertToGrid,
  formatMeasurement,
  measurementKeys,
  NOTES_MAX,
  otherUnit,
  parseMeasurements,
  suggestedLength,
  unitOf,
} from "@/lib/measurements";

const inches = { unit: "in", height: "65", length: "56", shoulder: "15.5", bust: "36", sleeve: "23", hips: "40" };
const cms = { unit: "cm", height: "165", length: "142", shoulder: "39", bust: "91", sleeve: "58", hips: "102" };

describe("parseMeasurements", () => {
  it("accepts a full set in inches and keeps the unit", () => {
    expect(parseMeasurements(inches)).toEqual({ unit: "in", height: 65, length: 56, shoulder: 15.5, bust: 36, sleeve: 23, hips: 40 });
  });

  it("accepts a full set in centimetres, stored exactly as entered", () => {
    expect(parseMeasurements(cms)).toEqual({ unit: "cm", height: 165, length: 142, shoulder: 39, bust: 91, sleeve: 58, hips: 102 });
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

  it("reads orders from before units existed as inches with height in centimetres", () => {
    expect(unitOf("height", "legacy")).toBe("cm");
    expect(unitOf("bust", "legacy")).toBe("in");
  });
});

describe("formatMeasurement", () => {
  it("writes the value as stored, with its unit", () => {
    expect(formatMeasurement("bust", 36, "in", "en")).toBe("36 in");
    expect(formatMeasurement("shoulder", 15.5, "in", "en")).toBe("15.5 in");
    expect(formatMeasurement("bust", 91, "cm", "en")).toBe("91 cm");
  });

  it("writes a height in inches as feet and inches", () => {
    expect(formatMeasurement("height", 65, "in", "en")).toBe("5′5″");
    expect(formatMeasurement("height", 60, "in", "en")).toBe("5′0″");
  });
});

describe("otherUnit", () => {
  it("gives the display-only conversion, rounded to a tenth", () => {
    expect(otherUnit("bust", 36, "in", "en")).toBe("≈ 91.4 cm");
    expect(otherUnit("bust", 91, "cm", "en")).toBe("≈ 35.8 in");
  });

  it("gives heights as whole centimetres or feet and inches", () => {
    expect(otherUnit("height", 65, "in", "en")).toBe("≈ 165 cm");
    expect(otherUnit("height", 165, "cm", "en")).toBe("≈ 5′5″");
  });
});

describe("convertToGrid", () => {
  it("moves a value to the nearest allowed value in the other unit", () => {
    expect(convertToGrid("bust", 36, "in", "cm")).toBe(91);
    expect(convertToGrid("shoulder", 39, "cm", "in")).toBe(15.5);
    expect(convertToGrid("height", 165, "cm", "in")).toBe(65);
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

describe("suggestedLength", () => {
  it("suggests a length range from height, in the same unit", () => {
    expect(suggestedLength(162, "cm")).toEqual([142, 145]);
    expect(suggestedLength(64, "in")).toEqual([56, 57]);
    expect(suggestedLength(180, "cm")).toEqual([157, 157]);
  });
});

describe("cleanNotes", () => {
  it("trims and caps notes, and ignores non-strings", () => {
    expect(cleanNotes("  hi  ")).toBe("hi");
    expect(cleanNotes("x".repeat(NOTES_MAX + 50))).toHaveLength(NOTES_MAX);
    expect(cleanNotes({ evil: true })).toBe("");
  });
});
