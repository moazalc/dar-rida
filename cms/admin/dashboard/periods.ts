/** Sales periods on the shop's clock (Dubai, UTC+4, no daylight saving), as UTC instants. */

const DUBAI = 4 * 3_600_000;

const dubaiParts = (now: Date) => {
  const d = new Date(now.getTime() + DUBAI);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
};

const at = (y: number, m: number) => new Date(Date.UTC(y, m, 1) - DUBAI);

/** Start of this month, last month, and this year, in Dubai. */
export function salesPeriods(now = new Date()) {
  const { y, m } = dubaiParts(now);
  return { thisMonth: at(y, m), lastMonth: at(y, m - 1), thisYear: at(y, 0) };
}

/** Statuses that count as a sale: paid and not cancelled. */
export const SOLD = ["paid", "in_production", "shipped", "completed"] as const;

export type CurrencyTotal = { currency: string; orders: number; revenue: number };

/** Database rows (numbers may arrive as strings) to totals per currency, biggest first. */
export function currencyTotals(rows: { currency: unknown; orders: unknown; revenue: unknown }[]): CurrencyTotal[] {
  return rows
    .map((r) => ({ currency: String(r.currency || "usd").toLowerCase(), orders: Number(r.orders) || 0, revenue: Number(r.revenue) || 0 }))
    .sort((a, b) => b.revenue - a.revenue || a.currency.localeCompare(b.currency));
}

/** The average order value per currency, in minor units (rounded). */
export const averageOrder = (t: CurrencyTotal) => (t.orders ? Math.round(t.revenue / t.orders) : 0);
