import { describe, expect, it } from "vitest";
import { isValidQuantity, unitPrice, type PricedDesign } from "@/lib/cart/pricing";
import { dollarsToCents, formatUsd } from "@/lib/money";

const designs = new Map<number, PricedDesign>([
  [1, { id: 1, price: 400, active: true }],
  [2, { id: 2, price: 512.5, active: true }],
  [3, { id: 3, price: 450, active: false }],
]);

describe("unitPrice", () => {
  it("prices a design from the database, in cents", () => {
    expect(unitPrice({ kind: "design", design: 1, quantity: 1 }, designs, 350)).toBe(40000);
    expect(unitPrice({ kind: "design", design: 2, quantity: 3 }, designs, 350)).toBe(51250);
  });

  it("accepts a populated design but still prices from the map", () => {
    expect(unitPrice({ kind: "design", design: { id: 1, price: 1 }, quantity: 1 }, designs, 350)).toBe(40000);
  });

  it("prices a custom abaya from the store settings", () => {
    expect(unitPrice({ kind: "custom", quantity: 1 }, designs, 350)).toBe(35000);
  });

  it("refuses designs that are switched off, missing or free, and an unset custom price", () => {
    expect(unitPrice({ kind: "design", design: 3, quantity: 1 }, designs, 350)).toBeNull();
    expect(unitPrice({ kind: "design", design: 99, quantity: 1 }, designs, 350)).toBeNull();
    expect(unitPrice({ kind: "design", design: null, quantity: 1 }, designs, 350)).toBeNull();
    expect(unitPrice({ kind: "custom", quantity: 1 }, designs, 0)).toBeNull();
    expect(unitPrice({ kind: "custom", quantity: 1 }, designs, null)).toBeNull();
  });
});

describe("money", () => {
  it("rounds dollars to whole cents", () => {
    expect(dollarsToCents(19.999)).toBe(2000);
    expect(dollarsToCents(Number.NaN)).toBe(0);
  });

  it("formats USD, hiding .00", () => {
    expect(formatUsd(40000)).toBe("$400");
    expect(formatUsd(51250)).toBe("$512.50");
  });
});

describe("isValidQuantity", () => {
  it("allows 1 to 10 whole pieces", () => {
    expect([1, 10].every(isValidQuantity)).toBe(true);
    expect([0, 11, 1.5, Number.NaN, "2"].some((n) => isValidQuantity(n))).toBe(false);
  });
});
