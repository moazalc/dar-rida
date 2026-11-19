import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SaveProfileFromOrder } from "@/components/account/save-profile-from-order";
import { StatusBadge } from "@/components/account/status-badge";
import { customerStatus } from "@/lib/account";
import { describeConfig } from "@/lib/configurator/describe";
import { customerOrder, requireCustomer } from "@/lib/customers";
import { CARRIERS, isCarrier } from "@/lib/orders/fulfilment";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { countryName, formatMoney, isCountry, type Currency } from "@/lib/markets";
import { formatMeasurement, measurementRows, type StoredMeasurements } from "@/lib/measurements";

type Params = { params: Promise<{ number: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { number } = await params;
  const t = (await getDictionary(await getLocale())).account.order;
  return { title: t.metaTitle.replace("{number}", decodeURIComponent(number)), robots: { index: false } };
}

export default async function OrderPage({ params }: Params) {
  const number = decodeURIComponent((await params).number);
  const customer = await requireCustomer(`/account/orders/${number}`);
  const order = await customerOrder(customer, number);
  if (!order) notFound();

  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.account.order;
  const status = customerStatus(order.status)!;
  const currency = ((order.currency as Currency) || "usd") as Currency;
  const money = (minor: number) => formatMoney(minor, currency);
  const date = new Intl.DateTimeFormat(locale === "ar" ? "ar-AE" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
  const a = order.shippingAddress;
  const country = a?.country && isCountry(a.country) ? countryName(a.country, locale) : a?.country;
  const address = [order.customerName, a?.line1, a?.line2, [a?.city, a?.state, a?.postalCode].filter(Boolean).join(", "), country].filter(Boolean);
  const defaultName = (customer.profiles ?? []).length === 0 ? dict.account.profiles.defaultName : "";
  const carrier = order.carrier && isCarrier(order.carrier) && order.carrier !== "other" ? CARRIERS[order.carrier].name : null;
  const shipped = order.shippedAt && (order.status === "shipped" || order.status === "completed");

  return (
    <section>
      <Link href="/account" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
        {t.back}
      </Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 dir="ltr" className="font-heading text-5xl leading-tight font-light md:text-6xl rtl:text-end">
            {order.number}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.placed.replace("{date}", date.format(new Date(order.createdAt)))}</p>
        </div>
        <StatusBadge status={status} label={dict.account.orders.status[status]} />
      </div>

      {shipped && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border border-border/70 bg-card p-5">
          <div className="text-sm">
            <p>
              {(carrier ? t.shippedOn.replace("{carrier}", carrier) : t.shippedOnNoCarrier).replace("{date}", date.format(new Date(order.shippedAt!)))}
            </p>
            {order.trackingNumber && (
              <p className="mt-1 text-muted-foreground">
                {t.trackingNumber}: <bdi dir="ltr">{order.trackingNumber}</bdi>
              </p>
            )}
            {order.status === "completed" && order.deliveredAt && (
              <p className="mt-1 text-muted-foreground">{t.deliveredOn.replace("{date}", date.format(new Date(order.deliveredAt)))}</p>
            )}
          </div>
          {order.trackingUrl && order.status === "shipped" && (
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center bg-primary px-7 text-sm tracking-[0.16em] text-primary-foreground uppercase transition-opacity hover:opacity-90"
            >
              {t.track}
            </a>
          )}
        </div>
      )}

      <div className="grid gap-12 pt-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
        <ul className="divide-y divide-border/60">
          {(order.lines ?? []).map((line) => {
            const name = line.kind === "custom" ? dict.cart.customName : locale === "ar" && line.nameAr ? line.nameAr : line.name;
            const choices = line.kind === "custom" ? describeConfig(line.config, dict) : [];
            return (
              <li key={line.id} className="flex flex-col gap-4 py-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-heading text-2xl md:text-3xl">{name}</p>
                    {line.quantity > 1 && <p className="text-sm text-muted-foreground">{t.quantity.replace("{count}", line.quantity.toLocaleString(locale))}</p>}
                  </div>
                  <p className="shrink-0 pt-1">
                    <bdi>{money(line.unitPrice * line.quantity)}</bdi>
                  </p>
                </div>
                {choices.length > 0 && (
                  <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-sm">
                    {choices.map((c) => (
                      <div key={c.label} className="contents">
                        <dt className="text-muted-foreground">{c.label}</dt>
                        <dd>{c.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                <div>
                  <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">{t.measurements}</p>
                  <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
                    {measurementRows(line.measurements as StoredMeasurements).map((r) => (
                      <div key={r.key} className="flex justify-between gap-3 border-b border-border/40 py-1">
                        <dt className="text-muted-foreground">{dict.measure.fields[r.key].label}</dt>
                        <dd className="tabular-nums">
                          <bdi>{formatMeasurement(r.key, r.value, r.unit, locale, dict.measure.units)}</bdi>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
                {line.notes && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">{t.notes}: </span>
                    <span className="break-words">{line.notes}</span>
                  </p>
                )}
                {line.id && line.measurements.unit !== "legacy" && (
                  <SaveProfileFromOrder order={order.number!} line={line.id} defaultName={defaultName} />
                )}
              </li>
            );
          })}
        </ul>

        <aside className="h-fit border border-border/70 bg-card p-6">
          <dl className="flex flex-col gap-2">
            <div className="flex justify-between gap-4">
              <dt>{t.subtotal}</dt>
              <dd>
                <bdi>{money(order.subtotal)}</bdi>
              </dd>
            </div>
            {(order.shipping || order.shippingZone) && (
              <div className="flex justify-between gap-4">
                <dt>{t.shipping}</dt>
                <dd>{order.shipping ? <bdi>{money(order.shipping)}</bdi> : t.shippingFree}</dd>
              </div>
            )}
            <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-border/60 pt-4">
              <dt>{t.total}</dt>
              <dd className="font-heading text-3xl">
                <bdi>{money(order.total)}</bdi>
              </dd>
            </div>
          </dl>
          {address.length > 0 && (
            <div className="mt-6 border-t border-border/60 pt-5 text-sm">
              <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">{t.shipTo}</p>
              <address className="mt-2 not-italic">
                {address.map((l, i) => (
                  <span key={i} className="block">
                    <bdi>{l}</bdi>
                  </span>
                ))}
              </address>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
