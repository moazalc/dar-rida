import { Fragment } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { MarketId } from "@/lib/markets";
import { cn } from "@/lib/utils";

/** The three promises each market sees in the bar at the top of the site. */
export function trustItems(market: MarketId | "libya", dict: Dictionary): string[] {
  const t = dict.trust;
  if (market === "uae") return [t.madeInDubai, t.everythingIncluded, t.bookFitting];
  if (market === "libya") return [t.madeInDubai, t.everythingIncluded, t.whatsappHelp];
  return [t.madeInDubai, t.deliveredWorldwide, t.whatsappHelp];
}

/** One line of promises, separated by gold dots. Scrolls sideways on narrow phones instead of wrapping. */
export function TrustBar({ items, className }: { items: string[]; className?: string }) {
  return (
    <div className={cn("overflow-x-auto bg-espresso text-ivory", className)} data-ground="dark">
      <ul className="mx-auto flex w-max items-center gap-3 px-4 py-2 text-caption tracking-[0.14em] uppercase">
        {items.map((item, i) => (
          <Fragment key={item}>
            {i > 0 ? <li aria-hidden="true" className="size-1 rounded-full bg-gold-soft" /> : null}
            <li className="whitespace-nowrap">{item}</li>
          </Fragment>
        ))}
      </ul>
    </div>
  );
}
