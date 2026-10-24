"use client";

import { createContext, useContext } from "react";
import type { Direction, Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

type I18nContextValue = {
  locale: Locale;
  dir: Direction;
  dict: Dictionary;
};

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Makes the active locale, direction, and dictionary available to Client
 * Components. The value is resolved on the server (in the root layout) and
 * passed down, so there is no client-side loading flash.
 */
export function I18nProvider({
  value,
  children,
}: {
  value: I18nContextValue;
  children: React.ReactNode;
}) {
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an <I18nProvider>");
  }
  return ctx;
}

/** Convenience hook for components that only need the translation strings. */
export function useDict(): Dictionary {
  return useI18n().dict;
}
