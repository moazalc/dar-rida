"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setShippingCountry } from "@/app/(frontend)/cart/actions";
import { useI18n } from "@/components/providers/i18n-provider";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { countryName, countryOptions, marketFor, type Country } from "@/lib/markets";
import { cn } from "@/lib/utils";

/**
 * "Shipping to United Arab Emirates · AED". Opens a searchable list of
 * countries; choosing one saves it and re-renders the page in that market.
 */
export function CountrySwitcher({ country, className }: { country: Country | null; className?: string }) {
  const { dict, locale, dir } = useI18n();
  const t = dict.market;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const options = useMemo(() => countryOptions(locale), [locale]);
  const q = query.trim().toLowerCase();
  const shown = q
    ? options.filter((o) => o.name.toLowerCase().includes(q) || countryName(o.code, "en").toLowerCase().includes(q) || o.code.toLowerCase() === q)
    : options;

  function choose(code: Country) {
    setOpen(false);
    setQuery("");
    if (code === country) return;
    startTransition(async () => {
      await setShippingCountry(code);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={pending}
        className={cn("inline-flex items-center gap-2 text-start transition-opacity hover:opacity-70 disabled:opacity-50", className)}
      >
        <span className="text-muted-foreground">{t.shipTo}</span>
        {country ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="underline underline-offset-4">{countryName(country, locale)}</span>
            <span className="text-muted-foreground">· {marketFor(country).currency.toUpperCase()}</span>
          </span>
        ) : (
          <span className="underline underline-offset-4">{t.choose}</span>
        )}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side={dir === "rtl" ? "left" : "right"}
          showCloseButton={false}
          className="gap-0 bg-background p-0 data-[side=left]:w-full data-[side=right]:w-full data-[side=left]:sm:max-w-md data-[side=right]:sm:max-w-md"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-3">
            <SheetTitle className="text-xs font-normal tracking-[0.22em] text-muted-foreground uppercase">{t.choose}</SheetTitle>
            <SheetClose className="inline-flex size-10 items-center justify-center text-2xl leading-none hover:opacity-70">
              <span aria-hidden>×</span>
              <span className="sr-only">{dict.measure.close}</span>
            </SheetClose>
          </div>
          <div className="border-b border-border/60 px-5 py-4">
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.search}
              aria-label={t.search}
              className="h-11 w-full border border-border bg-card px-3 outline-none focus:border-foreground"
            />
            <p className="mt-2 text-sm text-muted-foreground">{t.note}</p>
          </div>
          <ul className="flex-1 overflow-y-auto py-2">
            {shown.map((o) => (
              <li key={o.code}>
                <button
                  type="button"
                  onClick={() => choose(o.code)}
                  aria-current={o.code === country || undefined}
                  className={cn(
                    "flex w-full items-center gap-3 px-5 py-2.5 text-start hover:bg-linen",
                    o.code === country && "bg-muted font-medium",
                  )}
                >
                  <span className="flex-1">{o.name}</span>
                  <span className="text-xs text-muted-foreground">{marketFor(o.code).currency.toUpperCase()}</span>
                </button>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </>
  );
}
