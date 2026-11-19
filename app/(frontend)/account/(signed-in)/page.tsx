import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/account/status-badge";
import { statusAction } from "@/components/status-page";
import { customerStatus } from "@/lib/account";
import { customerOrders, requireCustomer } from "@/lib/customers";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { formatMoney, type Currency } from "@/lib/markets";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary(await getLocale())).account;
  return { title: `${t.orders.title} — Dar Rida`, robots: { index: false } };
}

export default async function OrdersPage() {
  const customer = await requireCustomer("/account");
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.account.orders;
  const orders = await customerOrders(customer);
  const date = new Intl.DateTimeFormat(locale === "ar" ? "ar-AE" : "en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <section>
      <h1 className="font-heading text-5xl leading-tight font-light md:text-6xl">{t.title}</h1>
      {orders.length === 0 ? (
        <div className="mt-10 flex flex-col items-start gap-6">
          <div>
            <p className="font-heading text-3xl">{t.empty}</p>
            <p className="mt-2 text-muted-foreground">{t.emptyBody}</p>
          </div>
          <Link href="/collection" className={statusAction.primary}>
            {t.shop}
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-border/60 border-y border-border/60">
          {orders.map((order) => {
            const status = customerStatus(order.status)!;
            const pieces = (order.lines ?? []).reduce((n, l) => n + l.quantity, 0);
            const names = (order.lines ?? [])
              .map((l) => (l.kind === "custom" ? dict.cart.customName : locale === "ar" && l.nameAr ? l.nameAr : l.name))
              .join(" · ");
            return (
              <li key={order.id}>
                <Link
                  href={`/account/orders/${order.number}`}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1 py-5 transition-colors hover:bg-linen/60 md:px-3"
                >
                  <p className="flex flex-wrap items-baseline gap-x-3">
                    <span dir="ltr" className="font-heading text-2xl">
                      {order.number}
                    </span>
                    <span className="text-sm text-muted-foreground">{t.placed.replace("{date}", date.format(new Date(order.createdAt)))}</span>
                  </p>
                  <p className="text-end">
                    <bdi>{formatMoney(order.total, (order.currency as Currency) || "usd")}</bdi>
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {pieces === 1 ? t.piecesOne : t.pieces.replace("{count}", pieces.toLocaleString(locale))} — {names}
                  </p>
                  <p className="text-end">
                    <StatusBadge status={status} label={t.status[status]} />
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
