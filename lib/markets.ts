import { shippingCountries } from "@/lib/shipping-countries";

// A market is a currency and a price list. The visitor's shipping country
// decides which one they're in, and checkout only ships to that country, so a
// price can never be paid in one market and shipped to another.

export type Currency = "usd" | "aed";
export type MarketId = "uae" | "global";
export type Country = (typeof shippingCountries)[number];

export type Market = { id: MarketId; currency: Currency };

export const markets: Record<MarketId, Market> = {
  uae: { id: "uae", currency: "aed" },
  global: { id: "global", currency: "usd" },
};

/** The visitor's chosen shipping country, set by the country switcher. */
export const COUNTRY_COOKIE = "dr_country";

const countrySet = new Set<string>(shippingCountries);

export function isCountry(value: unknown): value is Country {
  return typeof value === "string" && countrySet.has(value);
}

/** The UAE has its own prices; everywhere else (Libya too, for now) is global. */
export function marketFor(country: Country | null): Market {
  return country === "AE" ? markets.uae : markets.global;
}

/** Admin prices are entered in whole currency units; everything after works in minor units (cents, fils). */
export function toMinor(amount: number | null | undefined): number | null {
  return typeof amount === "number" && Number.isFinite(amount) && amount > 0 ? Math.round(amount * 100) : null;
}

/**
 * "$1,240" or "AED 4,500" (decimals only when there are some). Written the
 * same way in both languages, wrapped in <bdi> where it sits in Arabic text.
 */
export function formatMoney(minor: number, currency: Currency): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    currencyDisplay: currency === "usd" ? "symbol" : "code",
    minimumFractionDigits: minor % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })
    .format(minor / 100)
    .replace(/ /g, " ");
}

/** The country's name in the visitor's language, e.g. "United Arab Emirates" / "الإمارات العربية المتحدة". */
export function countryName(country: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(country) ?? country;
  } catch {
    return country;
  }
}

/** Every country we ship to with its name, sorted for a picker. */
export function countryOptions(locale: string): { code: Country; name: string }[] {
  const names = new Intl.DisplayNames([locale], { type: "region" });
  return shippingCountries
    .map((code) => ({ code, name: names.of(code) ?? code }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));
}
