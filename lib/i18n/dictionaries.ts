import "server-only";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";

// Dictionaries are lazily imported so only the active locale's strings are
// loaded on the server for a given request.
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en").then((m) => m.default),
  ar: () => import("./dictionaries/ar").then((m) => m.default),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}

export type { Dictionary };
