import "server-only";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";
import { mergeDictionary, type PartialDictionary } from "./merge";

// Dictionaries are lazily imported so only the active locale's strings are
// loaded on the server for a given request. English and Arabic are complete
// (typed as Dictionary); the others are laid over English, so a missing
// string shows in English rather than as a blank.
const full = {
  en: () => import("./dictionaries/en").then((m) => m.default),
  ar: () => import("./dictionaries/ar").then((m) => m.default),
};

const partial: Record<Exclude<Locale, keyof typeof full>, () => Promise<PartialDictionary>> = {
  fr: () => import("./dictionaries/fr").then((m) => m.default),
  ru: () => import("./dictionaries/ru").then((m) => m.default),
  tr: () => import("./dictionaries/tr").then((m) => m.default),
  de: () => import("./dictionaries/de").then((m) => m.default),
  es: () => import("./dictionaries/es").then((m) => m.default),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  if (locale === "en" || locale === "ar") return full[locale]();
  const [en, extra] = await Promise.all([full.en(), partial[locale]()]);
  return mergeDictionary(en, extra);
}

export type { Dictionary };
