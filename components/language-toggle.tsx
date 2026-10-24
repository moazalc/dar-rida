"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setLocale } from "@/lib/i18n/actions";
import { localeLabels, localeShortLabels } from "@/lib/i18n/config";
import { useI18n } from "@/components/providers/i18n-provider";

/**
 * Toggles between the two supported locales (en <-> ar).
 *
 * The button shows the language you are READING; the action it performs is
 * carried by the tooltip and the screen-reader text.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const next = locale === "en" ? "ar" : "en";
  const action = dict.common.switchLanguage.replace(
    "{language}",
    localeLabels[next],
  );

  function switchLocale() {
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={switchLocale}
      title={action}
      className={className}
    >
      <Languages className="size-4" />
      {localeShortLabels[locale]}
      {/* Appended rather than an aria-label, so the accessible name still
          contains the visible "EN" (WCAG 2.5.3). */}
      <span className="sr-only">{action}</span>
    </Button>
  );
}
