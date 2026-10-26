// Safe to import anywhere: the cookie that mirrors the cart's item count, so
// the header badge never has to ask Shopify.
export const CART_COUNT_COOKIE = "darrida_cart_count";

export function parseCartCount(value: string | undefined): number {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? Math.min(n, 99) : 0;
}
