import { localePath, publishedLocales, type Locale } from "./config";

/**
 * This page's canonical address and its address in every published language,
 * for <link rel="alternate" hreflang>. "x-default" (for anyone else) is English.
 */
export function alternatesFor(path: string, locale: Locale, base: string): { canonical: string; languages: Record<string, string> } {
  const url = (l: Locale) => `${base}${localePath(l, path)}`;
  const languages: Record<string, string> = Object.fromEntries(publishedLocales.map((l) => [l, url(l)]));
  languages["x-default"] = url("en");
  return { canonical: url(locale), languages };
}
