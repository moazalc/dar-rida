// i18n configuration — safe to import from both server and client code.

export const locales = ["en", "ar", "fr", "ru", "tr", "de", "es"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/**
 * Languages visitors can see: the language picker, the sitemap and hreflang.
 * The others are wired but wait for their translations (Phase 6).
 */
export const publishedLocales: readonly Locale[] = ["en", "ar"];

/** Published languages, or all of them while ALL_LOCALES=1 (for translation work). */
export function isRoutableLocale(locale: Locale): boolean {
  return publishedLocales.includes(locale) || process.env.ALL_LOCALES === "1";
}

/** Cookie that persists the visitor's chosen locale. */
export const LOCALE_COOKIE = "darrida_locale";

export type Direction = "ltr" | "rtl";

const localeDirection: Record<Locale, Direction> = {
  en: "ltr",
  ar: "rtl",
  fr: "ltr",
  ru: "ltr",
  tr: "ltr",
  de: "ltr",
  es: "ltr",
};

/** Native language name, used in the language switcher. */
export const localeLabels: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  fr: "Français",
  ru: "Русский",
  tr: "Türkçe",
  de: "Deutsch",
  es: "Español",
};

/** Short native form, for the header switcher. */
export const localeShortLabels: Record<Locale, string> = {
  en: "EN",
  ar: "عربي",
  fr: "FR",
  ru: "RU",
  tr: "TR",
  de: "DE",
  es: "ES",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export function getDirection(locale: Locale): Direction {
  return localeDirection[locale];
}

/**
 * Whether the given locale reads right-to-left. Handy for flipping
 * directional UI (icons, arrows) that logical CSS can't express.
 */
export function isRtl(locale: Locale): boolean {
  return getDirection(locale) === "rtl";
}

/** Set by the proxy on rewritten requests: the language from the address, and the path without it. */
export const LOCALE_HEADER = "x-dr-locale";
export const PATH_HEADER = "x-dr-path";
