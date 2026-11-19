import { describe, expect, it } from "vitest";
import { designPrice, isValidQuantity, unitPrice, type PricedDesign } from "@/lib/cart/pricing";
import { formatMoney, isCountry, marketFor, markets, toMinor } from "@/lib/markets";
import { formatMinorUnits } from "@/lib/money";
import { shippingFor, type ShippingSettings } from "@/lib/shipping";

const designs = new Map<number, PricedDesign>([
  [1, { id: 1, price: 400, priceAed: 1500, active: true }],
  [2, { id: 2, price: 512.5, priceAed: null, active: true }],
  [3, { id: 3, price: 450, priceAed: 1650, active: false }],
]);
const custom = { usd: 350, aed: 1300 };
const { uae, global } = markets;

describe("markets", () => {
  it("puts the UAE in its own market and everywhere else, Libya included, in global", () => {
    expect(marketFor("AE")).toEqual({ id: "uae", currency: "aed" });
    expect(marketFor("LY").id).toBe("global");
    expect(marketFor("GB").id).toBe("global");
    expect(marketFor(null).id).toBe("global");
  });

  it("only accepts countries we ship to", () => {
    expect(isCountry("AE")).toBe(true);
    expect(isCountry("ae")).toBe(false);
    expect(isCountry("ZZ")).toBe(false);
    expect(isCountry(undefined)).toBe(false);
  });
});

describe("unitPrice", () => {
  it("prices a design in the market's currency, in minor units", () => {
    expect(unitPrice({ kind: "design", design: 1, quantity: 1 }, designs, custom, global)).toBe(40000);
    expect(unitPrice({ kind: "design", design: 1, quantity: 1 }, designs, custom, uae)).toBe(150000);
    expect(unitPrice({ kind: "design", design: 2, quantity: 3 }, designs, custom, global)).toBe(51250);
  });

  it("never converts: a design with no AED price can't be bought in the UAE", () => {
    expect(unitPrice({ kind: "design", design: 2, quantity: 1 }, designs, custom, uae)).toBeNull();
    expect(designPrice({ price: 400, priceAed: 0 }, uae)).toBeNull();
  });

  it("accepts a populated design but still prices from the map", () => {
    expect(unitPrice({ kind: "design", design: { id: 1, price: 1 }, quantity: 1 }, designs, custom, global)).toBe(40000);
  });

  it("prices a custom abaya from the store settings in each currency", () => {
    expect(unitPrice({ kind: "custom", quantity: 1 }, designs, custom, global)).toBe(35000);
    expect(unitPrice({ kind: "custom", quantity: 1 }, designs, custom, uae)).toBe(130000);
  });

  it("refuses designs that are switched off, missing or free, and an unset custom price", () => {
    expect(unitPrice({ kind: "design", design: 3, quantity: 1 }, designs, custom, uae)).toBeNull();
    expect(unitPrice({ kind: "design", design: 99, quantity: 1 }, designs, custom, global)).toBeNull();
    expect(unitPrice({ kind: "design", design: null, quantity: 1 }, designs, custom, global)).toBeNull();
    expect(unitPrice({ kind: "custom", quantity: 1 }, designs, { usd: 0 }, global)).toBeNull();
    expect(unitPrice({ kind: "custom", quantity: 1 }, designs, { usd: 350, aed: null }, uae)).toBeNull();
  });
});

describe("shipping", () => {
  const settings: ShippingSettings = {
    uae: { fee: 25, freeOver: 2000 },
    zones: [
      { name: "GCC", countries: ["SA", "KW", "QA"], fee: 20 },
      { name: "Europe", countries: ["GB", "FR", "DE"], fee: 45, freeOver: 1000 },
    ],
    restOfWorld: { fee: 60 },
  };

  it("charges the UAE's flat fee, free over the threshold", () => {
    expect(shippingFor("AE", 150000, settings)).toEqual({ fee: 2500, zone: "UAE", free: false });
    expect(shippingFor("AE", 200000, settings)).toEqual({ fee: 0, zone: "UAE", free: true });
  });

  it("uses the zone that lists the country, else rest of world", () => {
    expect(shippingFor("SA", 40000, settings)).toEqual({ fee: 2000, zone: "GCC", free: false });
    expect(shippingFor("FR", 120000, settings)).toEqual({ fee: 0, zone: "Europe", free: true });
    expect(shippingFor("LY", 40000, settings)).toEqual({ fee: 6000, zone: "Rest of world", free: false });
  });

  it("is free when no fee is set", () => {
    expect(shippingFor("US", 40000, {})).toEqual({ fee: 0, zone: "Rest of world", free: true });
  });
});

describe("money", () => {
  it("rounds whole units to minor units and ignores empty prices", () => {
    expect(toMinor(19.999)).toBe(2000);
    expect(toMinor(Number.NaN)).toBeNull();
    expect(toMinor(0)).toBeNull();
    expect(toMinor(null)).toBeNull();
  });

  it("writes dollars with a symbol and dirhams with their code", () => {
    expect(formatMoney(40000, "usd")).toBe("$400");
    expect(formatMoney(51250, "usd")).toBe("$512.50");
    expect(formatMoney(150000, "aed")).toBe("AED 1,500");
  });

  it("reads Stripe's minor units with each currency's own decimals", () => {
    const plain = (s: string) => s.replace(/\s/g, " ");
    expect(plain(formatMinorUnits(422000, "aed", "en"))).toBe("AED 4,220.00");
    expect(plain(formatMinorUnits(123450, "kwd", "en"))).toBe("KWD 123.450");
    expect(formatMinorUnits(60000, "jpy", "en")).toBe("¥60,000");
  });
});

describe("isValidQuantity", () => {
  it("allows 1 to 10 whole pieces", () => {
    expect(isValidQuantity(1)).toBe(true);
    expect(isValidQuantity(10)).toBe(true);
    expect(isValidQuantity(0)).toBe(false);
    expect(isValidQuantity(1.5)).toBe(false);
  });
});
