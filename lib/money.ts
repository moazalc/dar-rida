// Prices are kept in whole US cents everywhere past the admin, so sums never drift.

/** Admin prices are entered in dollars; everything after works in cents. */
export function dollarsToCents(dollars: number | null | undefined): number {
  return typeof dollars === "number" && Number.isFinite(dollars) ? Math.round(dollars * 100) : 0;
}

/**
 * "$1,240" (or "$1,240.50"). Written the same way in both languages: the Arabic
 * format adds a right-to-left mark that flips "US$" around inside RTL text.
 */
export function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

/** Turn Stripe's minor units into a formatted amount, whatever the currency's decimals (KWD has 3, JPY none). */
export function formatMinorUnits(amount: number, currency: string, locale: string): string {
  const code = currency.toUpperCase();
  const digits = new Intl.NumberFormat("en", { style: "currency", currency: code }).resolvedOptions().maximumFractionDigits ?? 2;
  return new Intl.NumberFormat(locale === "ar" ? "ar-u-nu-latn" : "en", { style: "currency", currency: code }).format(
    amount / 10 ** digits,
  );
}
