import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/locale-link";
import { cookies } from "next/headers";
import { CheckoutButton } from "@/components/cart/checkout-button";
import { ShipTo } from "@/components/cart/ship-to";
import { CountrySwitcher } from "@/components/country-switcher";
import { LineControls } from "@/components/cart/line-controls";
import { DesignTile } from "@/components/collection/design-tile";
import { statusAction } from "@/components/status-page";
import { ADDRESS_COOKIE, pickAddress } from "@/lib/account";
import { loadBag, type BagLine } from "@/lib/cart";
import { addressList, getCustomer } from "@/lib/customers";
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { formatMeasurement, measurementRows } from "@/lib/measurements";
import { countryName, formatMoney, type Currency } from "@/lib/markets";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary(await getLocale())).cart;
  return { title: t.metaTitle, robots: { index: false } };
}

export default async function CartPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.cart;
  const [bag, customer, chosen] = await Promise.all([
    loadBag(locale, dict),
    getCustomer().catch(() => null),
    cookies().then((c) => c.get(ADDRESS_COOKIE)?.value ?? null),
  ]);
  const lines = bag?.lines ?? [];
  const addresses = customer ? addressList(customer) : [];
  const shipTo = pickAddress(addresses, bag?.country ?? null, chosen);
  // Totals mean nothing while a piece can't be bought here: show a dash, not "AED 0".
  const priced = lines.length > 0 && lines.every((l) => l.unitPrice !== null);

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
          </div>
        </div>
      ) : (
        <div className="grid gap-12 pt-4 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-20">
          <ul className="divide-y divide-border/60">
            {lines.map((line) => (
              <li key={line.id}>
                <Line line={line} dict={dict} locale={locale} currency={bag.currency} country={bag.country} />
              </li>
            ))}
          </ul>

          <aside className="h-fit border border-border/70 bg-card p-6 md:p-8 lg:sticky lg:top-28">
            <h2 className="text-xs tracking-[0.2em] text-muted-foreground uppercase">{t.summary}</h2>
            {addresses.length > 0 && <ShipTo addresses={addresses} selected={shipTo?.id ?? null} />}
            <CountrySwitcher country={bag.country} className="mt-5 flex-wrap text-sm" />
            <dl className="mt-5 flex flex-col gap-2 border-t border-border/60 pt-5">
              <div className="flex items-baseline justify-between gap-4">
                <dt>{t.subtotal}</dt>
                <dd>{priced ? <bdi>{formatMoney(bag.subtotal, bag.currency)}</bdi> : "—"}</dd>
              </div>
              {priced && bag.shipping && (
                <div className="flex items-baseline justify-between gap-4">
                  <dt>{t.shipping}</dt>
                  <dd>{bag.shipping.free ? t.shippingFree : <bdi>{formatMoney(bag.shipping.fee, bag.currency)}</bdi>}</dd>
                </div>
              )}
              <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-border/60 pt-4">
                <dt>{t.total}</dt>
                <dd className="font-heading text-3xl">{priced ? <bdi>{formatMoney(bag.total, bag.currency)}</bdi> : "—"}</dd>
              </div>
            </dl>
            <p className="mt-3 text-sm text-muted-foreground">
              {bag.country
                ? `${dict.market.currencyNote[bag.currency]} ${dict.market.lockNote.replace("{country}", countryName(bag.country, locale))}`
                : dict.market.unknown}
            </p>
            <CheckoutButton disabled={!bag.ready} />
            <p className="mt-2 text-sm text-muted-foreground">{t.madeToOrder}</p>
            {!customer && (
              <p className="mt-4 border-t border-border/60 pt-4 text-sm text-muted-foreground">
                <Link href="/account/sign-in?next=/cart" className="text-foreground underline underline-offset-4 hover:text-muted-foreground">
                  {dict.account.prompt.action}
                </Link>{" "}
                · {dict.account.prompt.bag}
              </p>
            )}
            <Link href="/collection" className="mt-6 inline-block text-sm underline underline-offset-4 hover:text-muted-foreground">
              {t.continue}
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}

function Line({
  line,
  dict,
  locale,
  currency,
  country,
}: {
  line: BagLine;
  dict: Dictionary;
  locale: string;
  currency: Currency;
  country: string | null;
}) {
  const t = dict.cart;
  const fields = dict.measure.fields;
  const unavailable = line.unitPrice === null;

  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-5 py-8 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-8">
      <Link href={line.href} aria-label={line.name} className="relative aspect-[4/5] overflow-hidden bg-muted">
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
                <bdi>{formatMoney(line.unitPrice! * line.quantity, currency)}</bdi>
              </p>
              {line.quantity > 1 && (
                <p className="text-xs text-muted-foreground">
                  {t.each.replace("{price}", formatMoney(line.unitPrice!, currency))}
                </p>
              )}
            </div>
          )}
        </div>

        {unavailable && (
          <p className="text-sm text-destructive">
            {line.unavailableHere && country
              ? dict.market.notHereNote.replace("{country}", countryName(country, locale))
              : t.unavailableNote}
          </p>
        )}

        {line.needsMeasurements && !unavailable && (
          <p className="text-sm text-destructive">
            {t.remeasureNote}{" "}
            <Link href={line.href} className="underline underline-offset-4">
              {t.remeasureCta}
            </Link>
          </p>
        )}

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
            {measurementRows(line.measurements).map((r) => (
              <div key={r.key} className="flex justify-between gap-3 border-b border-border/40 py-1">
                <dt className="text-muted-foreground">{fields[r.key].label}</dt>
                <dd className="tabular-nums">
                  <bdi>{formatMeasurement(r.key, r.value, r.unit, locale, dict.measure.units)}</bdi>
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
