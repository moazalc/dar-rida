// Prices are kept in whole US cents everywhere past the admin, so sums never drift.

/** Admin prices are entered in dollars; everything after works in cents. */
export function dollarsToCents(dollars: number | null | undefined): number {
  return typeof dollars === "number" && Number.isFinite(dollars) ? Math.round(dollars * 100) : 0;
}

/** "$1,240" (or "$1,240.50") in the page's language. */
export function formatUsd(cents: number, locale: string): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-u-nu-latn" : "en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}
