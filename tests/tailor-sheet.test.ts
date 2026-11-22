import { describe, expect, it } from "vitest";
import { sheetMeasurements } from "@/lib/orders/tailor-sheet";

describe("sheetMeasurements", () => {
  it("shows centimetres exactly and inches as a conversion when the customer typed cm", () => {
    const rows = sheetMeasurements({ unit: "cm", height: 165, length: 140, shoulder: 40, bust: 92, sleeve: 58, hips: 100 }, "en");
    expect(rows).toHaveLength(6);
    expect(rows[0]).toEqual({ key: "height", label: "Height", cm: "165 cm", in: "≈ 5′5″", exact: "cm" });
    expect(rows[3]).toEqual({ key: "bust", label: "Bust", cm: "92 cm", in: "≈ 36.2 in", exact: "cm" });
  });

  it("shows inches exactly and centimetres as a conversion when the customer typed inches", () => {
    const [height, , shoulder] = sheetMeasurements({ unit: "in", height: 65, length: 55, shoulder: 15.5, bust: 36, sleeve: 23, hips: 40 }, "en");
    expect(height).toMatchObject({ in: "5′5″", cm: "≈ 165 cm", exact: "in" });
    expect(shoulder).toMatchObject({ in: "15.5 in", cm: "≈ 39.4 cm", exact: "in" });
  });

  it("reads old orders: lengths in inches, height in centimetres", () => {
    const [height, length] = sheetMeasurements({ unit: "legacy", height: 165, length: 55, shoulder: 15, bust: 36, sleeve: 23, hips: 40 }, "en");
    expect(height.exact).toBe("cm");
    expect(length.exact).toBe("in");
  });

  it("writes Arabic labels and units with Western digits", () => {
    const [height, , , bust] = sheetMeasurements({ unit: "cm", height: 165, length: 140, shoulder: 40, bust: 92, sleeve: 58, hips: 100 }, "ar");
    expect(height.label).toBe("الطول الكامل");
    expect(bust.cm).toBe("92 سم");
    expect(bust.in).toBe("≈ 36.2 إنش");
  });

  it("skips missing values and handles no measurements", () => {
    expect(sheetMeasurements({ unit: "cm", height: 165 }, "en").map((r) => r.key)).toEqual(["height"]);
    expect(sheetMeasurements(null, "en")).toEqual([]);
  });
});
