"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useOptionalLocale } from "@/components/providers/i18n-provider";
import { localePath } from "@/lib/i18n/config";

/**
 * next/link that keeps the visitor's language: href="/collection" goes to
 * "/ar/collection" on an Arabic page. Other sites, #anchors and object hrefs
 * pass through unchanged; outside the shop layout the proxy picks the language.
 */
export default function LocaleLink({ href, ...props }: ComponentProps<typeof Link>) {
  const locale = useOptionalLocale();
  return <Link href={locale && typeof href === "string" ? localePath(locale, href) : href} {...props} />;
}
