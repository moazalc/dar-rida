import { sql } from "@payloadcms/db-postgres/drizzle";
import type { PayloadRequest } from "payload";
import type { Order } from "@/cms/payload-types";
import { addDays, CHECK_ON_GRACE_DAYS, orderFlags } from "@/lib/orders/fulfilment";
import { currencyTotals, salesPeriods, SOLD, type CurrencyTotal } from "./periods";

export type QueueOrder = {
  id: number;
  number: string;
  customer: string;
  country: string | null;
  total: number;
  currency: string;
  paidAt: string | null;
  readyBy: string | null;
  expectedDelivery: string | null;
  late: boolean;
  checkOn: boolean;
};

export type CountrySales = { country: string; currency: string; orders: number; revenue: number };
export type BestSeller = { name: string; designId: number | null; custom: boolean; pieces: number };

type Db = { drizzle: { execute: (query: unknown) => Promise<{ rows: Record<string, unknown>[] }> } };

const QUEUE_SIZE = 8;

function toQueue(o: Order, now: Date): QueueOrder {
  const flags = orderFlags(o, now);
  return {
    id: o.id,
    number: o.number ?? `#${o.id}`,
    customer: o.customerName || o.customerEmail || "",
    country: o.shippingCountry ?? o.shippingAddress?.country ?? null,
    total: o.total,
    currency: o.currency || "usd",
    paidAt: o.paidAt ?? null,
    readyBy: o.readyBy ?? null,
    expectedDelivery: o.expectedDelivery ?? null,
    ...flags,
  };
}

/**
 * Everything the dashboard shows. The order queues load a handful of rows each;
 * sales are summed by the database, so the dashboard stays quick however many
 * orders there are.
 */
export async function loadShopDashboard(req: PayloadRequest, now = new Date()) {
  const { payload } = req;
  const select = {
    number: true,
    customerName: true,
    customerEmail: true,
    shippingCountry: true,
    shippingAddress: true,
    total: true,
    currency: true,
    paidAt: true,
    readyBy: true,
    expectedDelivery: true,
    status: true,
  } as const;
  const queue = (status: string, sort: string) =>
    payload.find({ collection: "orders", where: { status: { equals: status } }, sort, limit: QUEUE_SIZE, depth: 0, select, req });
  const count = (where: Parameters<typeof payload.count>[0]["where"]) => payload.count({ collection: "orders", where, req }).then((r) => r.totalDocs);

  const p = salesPeriods(now);
  const db = payload.db as unknown as Db;
  const sold = sql.join(
    SOLD.map((s) => sql`${s}`),
    sql`, `,
  );

  const [fresh, making, shipped, late, checkOn, months, countries, sellers] = await Promise.all([
    queue("paid", "paidAt"),
    queue("in_production", "readyBy"),
    queue("shipped", "expectedDelivery"),
    count({ and: [{ status: { equals: "in_production" } }, { readyBy: { less_than: now.toISOString() } }] }),
    count({
      and: [{ status: { equals: "shipped" } }, { expectedDelivery: { less_than: addDays(now, -CHECK_ON_GRACE_DAYS).toISOString() } }],
    }),
    db.drizzle.execute(sql`
      select (paid_at >= ${p.thisMonth.toISOString()}) as this_month, currency, count(*) as orders, coalesce(sum(total), 0) as revenue
      from orders
      where status in (${sold}) and paid_at >= ${p.lastMonth.toISOString()}
      group by 1, 2`),
    db.drizzle.execute(sql`
      select coalesce(shipping_country, shipping_address_country, '') as country, currency, count(*) as orders, coalesce(sum(total), 0) as revenue
      from orders
      where status in (${sold}) and paid_at >= ${p.thisYear.toISOString()}
      group by 1, 2
      order by count(*) desc, 1
      limit 12`),
    db.drizzle.execute(sql`
      select l.kind, l.design_id, max(l.name) as name, sum(l.quantity) as pieces
      from orders_lines l join orders o on o.id = l._parent_id
      where o.status in (${sold}) and o.paid_at >= ${p.thisYear.toISOString()}
      group by l.kind, l.design_id
      order by sum(l.quantity) desc
      limit 5`),
  ]);

  const split = (thisMonth: boolean) => currencyTotals(months.rows.filter((r) => Boolean(r.this_month) === thisMonth) as never);

  return {
    queues: {
      fresh: { total: fresh.totalDocs, orders: (fresh.docs as Order[]).map((o) => toQueue(o, now)) },
      making: { total: making.totalDocs, orders: (making.docs as Order[]).map((o) => toQueue(o, now)), late },
      shipped: { total: shipped.totalDocs, orders: (shipped.docs as Order[]).map((o) => toQueue(o, now)), checkOn },
    },
    sales: { thisMonth: split(true), lastMonth: split(false) } satisfies Record<string, CurrencyTotal[]>,
    countries: countries.rows.map((r) => ({
      country: String(r.country ?? ""),
      currency: String(r.currency || "usd"),
      orders: Number(r.orders) || 0,
      revenue: Number(r.revenue) || 0,
    })) satisfies CountrySales[],
    bestSellers: sellers.rows.map((r) => ({
      name: String(r.name ?? ""),
      designId: r.design_id == null ? null : Number(r.design_id),
      custom: r.kind === "custom",
      pieces: Number(r.pieces) || 0,
    })) satisfies BestSeller[],
  };
}

export type ShopDashboard = Awaited<ReturnType<typeof loadShopDashboard>>;
