import { defaultLocale, isLocale, isRoutableLocale, type Locale } from "./config";

/**
 * Which language to send a visitor to when the address has none: the language
 * they chose before (cookie), then their browser's preference, then Arabic for
 * Libya, then English. Only languages that are switched on count.
 */
export function pickLocale(input: { cookie?: string | null; acceptLanguage?: string | null; country?: string | null }): Locale {
  if (isLocale(input.cookie) && isRoutableLocale(input.cookie)) return input.cookie;

  const wanted = (input.acceptLanguage ?? "")
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return { lang: tag.split("-")[0].toLowerCase(), q: q ? Number(q.slice(2)) || 0 : 1, index };
    })
    .filter((w) => w.lang && w.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  for (const { lang } of wanted) {
    if (isLocale(lang) && isRoutableLocale(lang)) return lang;
  }

  if (input.country?.toUpperCase() === "LY") return "ar";
  return defaultLocale;
}
