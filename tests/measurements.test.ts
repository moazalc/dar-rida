import { describe, expect, it } from "vitest";
import { cleanNotes, NOTES_MAX, parseMeasurements } from "@/lib/measurements";

const valid = { length: "56", bust: "36", shoulder: "15.5", sleeve: "23", hips: "40", height: "165" };

describe("parseMeasurements", () => {
  it("accepts all six allowed values and returns numbers", () => {
    expect(parseMeasurements(valid)).toEqual({ length: 56, bust: 36, shoulder: 15.5, sleeve: 23, hips: 40, height: 165 });
  });

  it("rejects a missing measurement", () => {
    expect(parseMeasurements({ ...valid, hips: undefined })).toBeNull();
  });

  it("rejects values outside the allowed list", () => {
    expect(parseMeasurements({ ...valid, length: "70" })).toBeNull();
    expect(parseMeasurements({ ...valid, shoulder: "15.25" })).toBeNull();
    expect(parseMeasurements({ ...valid, bust: "" })).toBeNull();
    expect(parseMeasurements({ ...valid, bust: "36; drop table" })).toBeNull();
  });

  it("rejects things that are not objects", () => {
    expect(parseMeasurements(null)).toBeNull();
    expect(parseMeasurements("56")).toBeNull();
  });
});

describe("cleanNotes", () => {
  it("trims and caps notes, and ignores non-strings", () => {
    expect(cleanNotes("  hi  ")).toBe("hi");
    expect(cleanNotes("x".repeat(NOTES_MAX + 50))).toHaveLength(NOTES_MAX);
    expect(cleanNotes({ evil: true })).toBe("");
  });
});
