import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckoutButton } from "@/components/cart/checkout-button";
import { LineControls } from "@/components/cart/line-controls";
import { DesignTile } from "@/components/collection/design-tile";
import { statusAction } from "@/components/status-page";
import { loadBag, type BagLine } from "@/lib/cart";
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { measurementKeys, measurementSpec } from "@/lib/measurements";
import { formatUsd } from "@/lib/money";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary(await getLocale())).cart;
  return { title: t.metaTitle, robots: { index: false } };
}

export default async function CartPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.cart;
  const bag = await loadBag(locale, dict);
  const lines = bag?.lines ?? [];

  return (
    <div className="mx-auto max-w-[90rem] px-4 pt-14 pb-24 md:px-10 md:pt-20 md:pb-36 xl:px-18">
      <header className="border-b border-border/60 pb-8 md:pb-12">
        <h1 className="font-heading text-5xl leading-tight font-light md:text-7xl">{t.title}</h1>
        {bag && bag.count > 0 && (
          <p className="mt-3 text-sm tracking-[0.2em] text-muted-foreground uppercase">
            {bag.count === 1 ? t.countOne : t.count.replace("{count}", bag.count.toLocaleString(locale))}
          </p>
        )}
      </header>

      {!bag || lines.length === 0 ? (
        <div className="flex flex-col items-start gap-8 py-16 md:py-20">
          <div>
            <p className="font-heading text-3xl">{t.empty}</p>
            <p className="mt-3 max-w-lg text-muted-foreground">{t.emptyBody}</p>
          </div>
          <div className="flex flex-wrap gap-3.5">
            <Link href="/collection" className={statusAction.primary}>
              {t.toCollection}
            </Link>
            <Link href="/design" className={statusAction.secondary}>
              {t.design}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-12 pt-4 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-20">
          <ul className="divide-y divide-border/60">
            {lines.map((line) => (
              <li key={line.id}>
                <Line line={line} dict={dict} locale={locale} />
              </li>
            ))}
          </ul>

          <aside className="h-fit border border-border/70 bg-card p-6 md:p-8 lg:sticky lg:top-28">
            <h2 className="text-xs tracking-[0.2em] text-muted-foreground uppercase">{t.summary}</h2>
            <div className="mt-5 flex items-baseline justify-between gap-4">
              <span>{t.subtotal}</span>
              <span className="font-heading text-3xl">
                <bdi>{formatUsd(bag.subtotal, locale)}</bdi>
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{t.taxNote}</p>
            <CheckoutButton disabled={!bag.ready} />
            <p className="mt-2 text-sm text-muted-foreground">{t.madeToOrder}</p>
            <Link href="/collection" className="mt-6 inline-block text-sm underline underline-offset-4 hover:text-muted-foreground">
              {t.continue}
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}

function Line({ line, dict, locale }: { line: BagLine; dict: Dictionary; locale: string }) {
  const t = dict.cart;
  const units = dict.design.sizing.units;
  const fields = dict.design.sizing.fields;
  const unavailable = line.unitPrice === null;

  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-5 py-8 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-8">
      <Link href={line.href} className="relative aspect-[4/5] overflow-hidden bg-muted">
        {line.image ? (
          <Image src={line.image.url} alt={line.image.alt} fill sizes="9rem" className="object-cover" />
        ) : line.drawing ? (
          <DesignTile drawing={line.drawing} label={line.name} id={`bag-leaves-${line.id}`} className="absolute inset-0" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-espresso p-3 text-center font-heading text-lg text-champagne">
            {t.custom}
          </div>
        )}
      </Link>
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p dir={line.code ? "ltr" : undefined} className="text-xs tracking-[0.2em] text-muted-foreground uppercase rtl:text-end">
              {line.code ?? t.custom}
            </p>
            <Link href={line.href} className="font-heading text-2xl leading-tight hover:opacity-70 md:text-3xl">
              {line.name}
            </Link>
          </div>
          {!unavailable && (
            <div className="shrink-0 pt-1 text-end">
              <p>
                <bdi>{formatUsd(line.unitPrice! * line.quantity, locale)}</bdi>
              </p>
              {line.quantity > 1 && (
                <p className="text-xs text-muted-foreground">
                  {t.each.replace("{price}", formatUsd(line.unitPrice!, locale))}
                </p>
              )}
            </div>
          )}
        </div>

        {unavailable && <p className="text-sm text-destructive">{t.unavailableNote}</p>}

        {line.choices.length > 0 && (
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-sm">
            {line.choices.map((c) => (
              <div key={c.label} className="contents">
                <dt className="text-muted-foreground">{c.label}</dt>
                <dd className="break-words">{c.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <details className="group text-sm">
          <summary className="cursor-pointer list-none text-muted-foreground underline-offset-4 hover:text-foreground hover:underline [&::-webkit-details-marker]:hidden">
            {t.measurements} <span className="inline-block transition-transform group-open:rotate-180">⌄</span>
          </summary>
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
            {measurementKeys.map((m) => (
              <div key={m} className="flex justify-between gap-3 border-b border-border/40 py-1">
                <dt className="text-muted-foreground">{fields[m].label}</dt>
                <dd className="tabular-nums">
                  {line.measurements[m].toLocaleString(locale)} {units[measurementSpec[m].unit]}
                </dd>
              </div>
            ))}
          </dl>
          {line.notes && (
            <p className="mt-3">
              <span className="text-muted-foreground">{t.notes}: </span>
              <span className="break-words">{line.notes}</span>
            </p>
          )}
        </details>

        <LineControls lineId={line.id} quantity={line.quantity} />
      </div>
    </div>
  );
}
