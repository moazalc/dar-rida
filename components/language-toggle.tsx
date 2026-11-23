"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { setLocale } from "@/lib/i18n/actions";
import { localeLabels, localeShortLabels, publishedLocales, switchLocalePath, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/components/providers/i18n-provider";

/**
 * Switches the page to another published language by moving to the same
 * address under that language (/en/cart → /ar/cart), and remembers the choice.
 * With two languages it's a toggle; with more, a list.
 *
 * The toggle shows the language you are READING; the action it performs is
 * carried by the tooltip and the screen-reader text.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    startTransition(async () => {
      await setLocale(next);
      router.push(switchLocalePath(window.location.pathname, next) + window.location.search);
    });
  }

  if (publishedLocales.length > 2) {
    return (
      <label className={cn("relative inline-flex min-h-11 items-center gap-1.5 text-small", className)}>
        <Languages aria-hidden="true" className="size-4" />
        <span className="sr-only">{dict.common.language}</span>
        <select
          value={locale}
          disabled={pending}
          onChange={(e) => switchTo(e.target.value as Locale)}
          className="appearance-none bg-transparent pe-1"
        >
          {publishedLocales.map((l) => (
            <option key={l} value={l} lang={l}>
              {localeLabels[l]}
            </option>
          ))}
        </select>
      </label>
    );
  }

  const next = publishedLocales.find((l) => l !== locale) ?? publishedLocales[0];
  const action = dict.common.switchLanguage.replace("{language}", localeLabels[next]);

  return (
    <Button
      variant="quiet"
      size="md"
      disabled={pending}
      onClick={() => switchTo(next)}
      title={action}
      className={cn("no-underline", className)}
    >
      <Languages className="size-4" />
      {localeShortLabels[locale]}
      {/* Appended rather than an aria-label, so the accessible name still
          contains the visible "EN" (WCAG 2.5.3). */}
      <span className="sr-only">{action}</span>
    </Button>
  );
}
