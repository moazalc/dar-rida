// i18n configuration — safe to import from both server and client code.

import { adminRoute } from "@/lib/admin-route";

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

/** Paths that never carry a language: the admin, the API, files, print pages and the coming-soon page. */
export function isUnlocalizedPath(pathname: string): boolean {
  const under = (base: string) => pathname === base || pathname.startsWith(`${base}/`);
  if (["/api", "/admin", "/media", "/print", "/_next", "/coming-soon", adminRoute()].some(under)) return true;
  return (pathname.split("/").pop() ?? "").includes(".");
}

/**
 * The same address in the given language: "/collection" → "/ar/collection".
 * Leaves alone anything that isn't a shop page (other sites, mailto:, #anchors,
 * relative links, the admin, the API, files) and links that already name a language.
 */
export function localePath(locale: Locale, href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const cut = href.search(/[?#]/);
  const path = cut === -1 ? href : href.slice(0, cut);
  const tail = cut === -1 ? "" : href.slice(cut);
  if (isUnlocalizedPath(path) || isLocale(path.split("/")[1])) return href;
  return `${path === "/" ? `/${locale}` : `/${locale}${path}`}${tail}`;
}

/** The current page in another language: swaps the prefix, or adds one. */
export function switchLocalePath(pathname: string, to: Locale): string {
  const parts = pathname.split("/");
  const rest = isLocale(parts[1]) ? `/${parts.slice(2).join("/")}` : pathname;
  const clean = rest.replace(/\/+$/, "") || "/";
  return clean === "/" ? `/${to}` : `/${to}${clean}`;
}
