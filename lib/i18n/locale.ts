import { cookies, headers } from "next/headers";
import { COUNTRY_COOKIE } from "@/lib/markets";
import { isLocale, LOCALE_COOKIE, LOCALE_HEADER, PATH_HEADER, type Locale } from "./config";
import { pickLocale } from "./negotiate";

/**
 * The active locale for the current request. Server-only.
 *
 * Shop pages get it from the address: the proxy passes it in a header. Routes
 * the proxy leaves alone (coming-soon, the global 404) fall back to the
 * cookie, the browser's languages, then the default.
 */
export async function getLocale(): Promise<Locale> {
  const h = await headers();
  const fromAddress = h.get(LOCALE_HEADER);
  if (isLocale(fromAddress)) return fromAddress;

  const store = await cookies();
  return pickLocale({
    cookie: store.get(LOCALE_COOKIE)?.value,
    acceptLanguage: h.get("accept-language"),
    country: store.get(COUNTRY_COOKIE)?.value,
  });
}

/** The page's path without the language prefix ("/collection"), or "/" when unknown. */
export async function getPathname(): Promise<string> {
  return (await headers()).get(PATH_HEADER) ?? "/";
}
