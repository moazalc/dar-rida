import "server-only";

import geoip from "fast-geoip";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { COUNTRY_COOKIE, isCountry, marketFor, type Country, type Market } from "@/lib/markets";

/**
 * Guess a first-time visitor's country: a country header from the proxy in
 * front of the site (Cloudflare's, or one nginx sets), then the IP looked up in
 * the offline GeoLite data, then the browser's language region ("ar-AE").
 */
async function detectCountry(): Promise<Country | null> {
  const h = await headers();
  for (const name of ["cf-ipcountry", "x-country-code"]) {
    const value = h.get(name)?.toUpperCase();
    if (isCountry(value)) return value;
  }

  const ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "").trim().replace(/^::ffff:/, "");
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
    try {
      const found = (await geoip.lookup(ip))?.country;
      if (isCountry(found)) return found;
    } catch (error) {
      console.error("Looking up the visitor's country failed", error);
    }
  }

  for (const part of (h.get("accept-language") ?? "").split(",")) {
    const region = part.split(";")[0].trim().split("-")[1]?.toUpperCase();
    if (isCountry(region)) return region;
  }
  return null;
}

/**
 * Where the visitor is shipping to: their choice from the country switcher, or
 * the detected country until they choose. Null when nothing could be told, and
 * then the bag asks before checkout.
 */
export const getCountry = cache(async (): Promise<Country | null> => {
  const chosen = (await cookies()).get(COUNTRY_COOKIE)?.value;
  if (isCountry(chosen)) return chosen;
  return detectCountry();
});

/** The visitor's market, from their shipping country. */
export async function getMarket(): Promise<Market> {
  return marketFor(await getCountry());
}
