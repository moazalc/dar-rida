import { toMinor, type Market } from "@/lib/markets";

/** What pricing needs to know about a design. */
export type PricedDesign = { id: number; price: number; priceAed?: number | null; active?: boolean | null };

/** The Design-your-own price in each market's currency, as entered in the admin. */
export type CustomPrices = { usd?: number | null; aed?: number | null };

export type PricingLine = {
  kind: "design" | "custom";
  /** The design's id, or the populated design. */
  design?: number | PricedDesign | null;
  quantity: number;
};

/** A design's price in a market, in minor units, or null when it has none there. */
export function designPrice(design: Pick<PricedDesign, "price" | "priceAed">, market: Market): number | null {
  return toMinor(market.currency === "aed" ? design.priceAed : design.price);
}

/**
 * A line's unit price in the market's minor units, always worked out from the
 * current designs and store settings, never from anything the browser sent.
 * Null when the line can't be bought there: its design is gone, switched off,
 * or has no price in that market's currency.
 */
export function unitPrice(line: PricingLine, designs: Map<number, PricedDesign>, custom: CustomPrices, market: Market): number | null {
  if (line.kind === "custom") return toMinor(market.currency === "aed" ? custom.aed : custom.usd);
  const id = typeof line.design === "object" && line.design ? line.design.id : line.design;
  const design = typeof id === "number" ? designs.get(id) : undefined;
  if (!design || design.active === false) return null;
  return designPrice(design, market);
}

export const MAX_QUANTITY = 10;

export function isValidQuantity(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= MAX_QUANTITY;
}
