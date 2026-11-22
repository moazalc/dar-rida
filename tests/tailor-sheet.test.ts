import { describe, expect, it } from "vitest";
import { sheetMeasurements } from "@/lib/orders/tailor-sheet";

describe("sheetMeasurements", () => {
  it("shows centimetres exactly and inches as a conversion when the customer typed cm", () => {
    const rows = sheetMeasurements({ unit: "cm", length: 140, shoulder: 40, bust: 92, waist: 76, hips: 100, sleeve: 58 }, "en");
    expect(rows.map((r) => r.key)).toEqual(["length", "shoulder", "bust", "waist", "hips", "sleeve"]);
    expect(rows[2]).toEqual({ key: "bust", label: "Bust", cm: "92 cm", in: "≈ 36.2 in", exact: "cm" });
    expect(rows[3]).toEqual({ key: "waist", label: "Waist", cm: "76 cm", in: "≈ 29.9 in", exact: "cm" });
  });

  it("shows inches exactly and centimetres as a conversion when the customer typed inches", () => {
    const [, shoulder] = sheetMeasurements({ unit: "in", length: 55, shoulder: 15.5, bust: 36, waist: 30, hips: 40, sleeve: 23 }, "en");
    expect(shoulder).toMatchObject({ in: "15.5 in", cm: "≈ 39.4 cm", exact: "in" });
  });

  it("reads old orders: all in inches, without a waist", () => {
    const rows = sheetMeasurements({ unit: "legacy", length: 55, shoulder: 15, bust: 36, sleeve: 23, hips: 40 }, "en");
    expect(rows.every((r) => r.exact === "in")).toBe(true);
    expect(rows.find((r) => r.key === "waist")).toBeUndefined();
  });

  it("writes Arabic labels and units with Western digits", () => {
    const rows = sheetMeasurements({ unit: "cm", length: 140, shoulder: 40, bust: 92, waist: 76, hips: 100, sleeve: 58 }, "ar");
    expect(rows[3].label).toBe("دوران الخصر");
    expect(rows[2].cm).toBe("92 سم");
    expect(rows[2].in).toBe("≈ 36.2 إنش");
  });

  it("skips missing values and handles no measurements", () => {
    expect(sheetMeasurements({ unit: "cm", bust: 92 }, "en").map((r) => r.key)).toEqual(["bust"]);
    expect(sheetMeasurements(null, "en")).toEqual([]);
  });
});
