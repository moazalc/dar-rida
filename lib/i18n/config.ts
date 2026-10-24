// i18n configuration — safe to import from both server and client code.

export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Cookie that persists the visitor's chosen locale. */
export const LOCALE_COOKIE = "darrida_locale";

export type Direction = "ltr" | "rtl";

const localeDirection: Record<Locale, Direction> = {
  en: "ltr",
  ar: "rtl",
};

/** Native language name, used in the language switcher. */
export const localeLabels: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};

/** Short native form, for the header switcher. */
export const localeShortLabels: Record<Locale, string> = {
  en: "EN",
  ar: "عربي",
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
