import { dollarsToCents } from "@/lib/money";

/** What pricing needs to know about a design. */
export type PricedDesign = { id: number; price: number; active?: boolean | null };

export type PricingLine = {
  kind: "design" | "custom";
  /** The design's id, or the populated design. */
  design?: number | PricedDesign | null;
  quantity: number;
};

/**
 * A line's unit price in cents, always worked out from the current designs and
 * store settings, never from anything the browser sent. Null when the line can't
 * be bought: its design is gone or switched off.
 */
export function unitPrice(
  line: PricingLine,
  designs: Map<number, PricedDesign>,
  customAbayaPrice: number | null | undefined,
): number | null {
  if (line.kind === "custom") {
    const cents = dollarsToCents(customAbayaPrice);
    return cents > 0 ? cents : null;
  }
  const id = typeof line.design === "object" && line.design ? line.design.id : line.design;
  const design = typeof id === "number" ? designs.get(id) : undefined;
  if (!design || design.active === false) return null;
  const cents = dollarsToCents(design.price);
  return cents > 0 ? cents : null;
}

export const MAX_QUANTITY = 10;

export function isValidQuantity(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= MAX_QUANTITY;
}
