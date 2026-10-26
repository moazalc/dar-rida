import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LineControls } from "@/components/cart/line-controls";
import { Placeholder } from "@/components/placeholder";
import { statusAction } from "@/components/status-page";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { getCart, type CartLine } from "@/lib/shopify/cart";
import { formatMoney } from "@/lib/shopify/money";
import { isShopifyConfigured } from "@/lib/shopify/storefront";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary(await getLocale())).cart;
  return { title: t.metaTitle, robots: { index: false } };
}

/** Configurator designs are lines of the "configurator"-tagged product; their choices live in attributes. */
function isCustom(line: CartLine) {
  return line.merchandise.product.tags.includes("configurator");
}

export default async function CartPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.cart;
  const cart = await getCart(locale).catch(() => null);
  const lines = cart?.lines ?? [];

  return (
    <div className="mx-auto max-w-[90rem] px-4 pt-14 pb-24 md:px-10 md:pt-20 md:pb-36 xl:px-18">
      <header className="border-b border-border/60 pb-8 md:pb-12">
        <h1 className="font-heading text-5xl leading-tight font-light md:text-7xl">{t.title}</h1>
        {cart && cart.totalQuantity > 0 && (
          <p className="mt-3 text-sm tracking-[0.2em] text-muted-foreground uppercase">
            {cart.totalQuantity === 1 ? t.countOne : t.count.replace("{count}", cart.totalQuantity.toLocaleString(locale))}
          </p>
        )}
      </header>

      {lines.length === 0 ? (
        <div className="flex flex-col items-start gap-8 py-16 md:py-20">
          <div>
            <p className="font-heading text-3xl">{t.empty}</p>
            <p className="mt-3 max-w-lg text-muted-foreground">
              {isShopifyConfigured() ? t.emptyBody : t.notConnected}
            </p>
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
            {lines.map((line) => {
              const custom = isCustom(line);
              const m = line.merchandise;
              const details = custom
                ? line.attributes
                : m.selectedOptions
                    .filter((o) => o.value !== "Default Title")
                    .map((o) => ({ key: o.name, value: o.value }));
              return (
                <li key={line.id} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-5 py-8 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-8">
                  <Link
                    href={custom ? "/design" : `/collection/${m.product.handle}`}
                    className="relative aspect-[4/5] overflow-hidden bg-muted"
                  >
                    {m.image ? (
                      <Image src={m.image.url} alt={m.image.altText ?? m.product.title} fill sizes="9rem" className="object-cover" />
                    ) : (
                      <Placeholder label={m.product.title} className="absolute inset-0" />
                    )}
                  </Link>
                  <div className="flex min-w-0 flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        {custom && (
                          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">{t.custom}</p>
                        )}
                        <Link
                          href={custom ? "/design" : `/collection/${m.product.handle}`}
                          className="font-heading text-2xl leading-tight hover:opacity-70 md:text-3xl"
                        >
                          {m.product.title}
                        </Link>
                      </div>
                      <p className="shrink-0 pt-1">
                        <bdi>{formatMoney(line.cost.totalAmount, locale)}</bdi>
                      </p>
                    </div>
                    {details.length > 0 && (
                      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-sm">
                        {details.map((d) => (
                          <div key={d.key} className="contents">
                            <dt className="text-muted-foreground">{d.key}</dt>
                            <dd className="break-words">{d.value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    <LineControls lineId={line.id} quantity={line.quantity} />
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="h-fit border border-border/70 bg-card p-6 md:p-8 lg:sticky lg:top-28">
            <h2 className="text-xs tracking-[0.2em] text-muted-foreground uppercase">{t.summary}</h2>
            <div className="mt-5 flex items-baseline justify-between gap-4">
              <span>{t.subtotal}</span>
              <span className="font-heading text-3xl">
                <bdi>{formatMoney(cart!.cost.subtotalAmount, locale)}</bdi>
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{t.taxNote}</p>
            <a href={cart!.checkoutUrl} className={`${statusAction.primary} mt-7 w-full`}>
              {t.checkout}
            </a>
            <p className="mt-5 text-sm text-muted-foreground">{t.madeToOrder}</p>
            <Link href="/collection" className="mt-6 inline-block text-sm underline underline-offset-4 hover:text-muted-foreground">
              {t.continue}
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
