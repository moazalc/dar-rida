"use client";

import { usePathname } from "next/navigation";
import { stripLocale } from "@/lib/i18n/config";

/** The current page's path without the language prefix ("/en/account" → "/account"), for comparing against routes. */
export function useShopPathname(): string {
  return stripLocale(usePathname());
}
