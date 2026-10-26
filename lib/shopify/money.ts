import type { Locale } from "@/lib/i18n/config";

/** Format a Shopify money value for the shopper's language, e.g. "AED 1,250". */
export function formatMoney({ amount, currencyCode }: { amount: string; currencyCode: string }, locale: Locale) {
  const value = Number(amount);
  return new Intl.NumberFormat(locale === "ar" ? "ar-AE" : "en-AE", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}
