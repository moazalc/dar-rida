/** Turn Stripe's minor units into a formatted amount, whatever the currency's decimals (KWD has 3, JPY none). */
export function formatMinorUnits(amount: number, currency: string, locale: string): string {
  const code = currency.toUpperCase();
  const digits = new Intl.NumberFormat("en", { style: "currency", currency: code }).resolvedOptions().maximumFractionDigits ?? 2;
  return new Intl.NumberFormat(locale === "ar" ? "ar-u-nu-latn" : "en", { style: "currency", currency: code }).format(
    amount / 10 ** digits,
  );
}
