import Link from "next/link";
import { RidaDrawing, ridaModels } from "@/components/drawings/rida-drawings";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * The four collection designs side by side, each shown as a line drawing in
 * the builder's style. Prices join the cards once the catalogue moves off
 * Shopify; until then the cards only name the design and its signature.
 */
export function CollectionRow({ dict }: { dict: Dictionary }) {
  const t = dict.home.collectionRow;

  return (
    <section className="mx-auto max-w-[90rem] px-4 py-24 md:px-10 md:py-32 xl:px-18">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">{t.eyebrow}</p>
          <h2 className="mt-4 font-heading text-5xl leading-none font-light text-balance md:text-6xl">{t.title}</h2>
        </div>
        <Link
          href="/collection"
          className="border-b border-foreground pb-1 text-sm tracking-[0.16em] uppercase transition-opacity hover:opacity-60"
        >
          {t.cta}
        </Link>
      </div>

      <ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
        {ridaModels.map((model, i) => {
          const m = t.models[i];
          return (
            <li key={model}>
              <Link href="/collection" className="group flex flex-col">
                <div className="relative flex aspect-[3/4] items-center justify-center border border-champagne/40 bg-card">
                  <RidaDrawing
                    model={model}
                    label={m.alt}
                    className="mt-[6%] h-[90%] w-auto transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                  <span className="absolute start-3 top-3 bg-background px-2 py-1 text-[0.65rem] tracking-[0.18em] uppercase">
                    {t.badge}
                  </span>
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-champagne pt-3">
                  <span dir="ltr" className="font-heading text-2xl whitespace-nowrap md:text-3xl">
                    {m.code}
                  </span>
                  <span className="text-xs tracking-[0.14em] text-muted-foreground uppercase">{m.cut}</span>
                </div>
                <p className="mt-2 font-heading text-lg leading-snug">{m.name}</p>
                <p lang={m.nameAltLang} className="font-heading text-base leading-snug text-muted-foreground">
                  {m.nameAlt}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
