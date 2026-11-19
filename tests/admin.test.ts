import { describe, expect, it } from "vitest";
import { averageOrder, currencyTotals, salesPeriods } from "@/cms/admin/dashboard/periods";
import { barWidths, dayDistance, percentChange } from "@/cms/admin/dashboard/format";
import { referrerLabel, weekStarts } from "@/cms/admin/dashboard/analytics";
import { adminRoute } from "@/lib/admin-route";

describe("salesPeriods", () => {
  it("starts months at midnight in Dubai", () => {
    // 1 Dec, 01:00 in Dubai is still 30 Nov in UTC: it is already December's sales.
    const p = salesPeriods(new Date("2026-11-30T21:00:00Z"));
    expect(p.thisMonth.toISOString()).toBe("2026-11-30T20:00:00.000Z");
    expect(p.lastMonth.toISOString()).toBe("2026-10-31T20:00:00.000Z");
    expect(p.thisYear.toISOString()).toBe("2025-12-31T20:00:00.000Z");
  });

  it("goes back into last year in January", () => {
    const p = salesPeriods(new Date("2027-01-10T12:00:00Z"));
    expect(p.lastMonth.toISOString()).toBe("2026-11-30T20:00:00.000Z");
  });
});

describe("currencyTotals", () => {
  it("reads database rows (numbers as strings), biggest first, never mixing currencies", () => {
    const totals = currencyTotals([
      { currency: "usd", orders: "2", revenue: "160000" },
      { currency: "AED", orders: 3, revenue: "870000" },
    ]);
    expect(totals).toEqual([
      { currency: "aed", orders: 3, revenue: 870000 },
      { currency: "usd", orders: 2, revenue: 160000 },
    ]);
    expect(averageOrder(totals[0])).toBe(290000);
    expect(averageOrder({ currency: "usd", orders: 0, revenue: 0 })).toBe(0);
  });
});

describe("dashboard formatting", () => {
  const now = new Date("2026-11-19T10:00:00Z");

  it("counts whole Dubai days", () => {
    expect(dayDistance("2026-11-19T01:00:00Z", now)).toBe("today");
    expect(dayDistance("2026-11-18T10:00:00Z", now)).toBe("yesterday");
    expect(dayDistance("2026-11-16T10:00:00Z", now)).toBe("3 days ago");
    expect(dayDistance("2026-11-22T10:00:00Z", now)).toBe("in 3 days");
    expect(dayDistance("2026-11-16T10:00:00Z", now, "ar")).toBe("قبل 3 أيام");
  });

  it("compares with the previous period", () => {
    expect(percentChange(120, 100)).toBe("+20%");
    expect(percentChange(50, 100)).toBe("−50%");
    expect(percentChange(5, 0)).toBeNull();
  });

  it("keeps small bars visible", () => {
    expect(barWidths([100, 1, 0])).toEqual([100, 2, 0]);
  });
});

describe("Umami helpers", () => {
  it("lists twelve Mondays, oldest first, ending this week", () => {
    const weeks = weekStarts(new Date("2026-11-19T10:00:00Z"));
    expect(weeks).toHaveLength(12);
    expect(weeks.at(-1)).toBe("2026-11-16");
  });

  it("shortens referrers", () => {
    expect(referrerLabel("https://www.instagram.com/")).toBe("instagram.com");
    expect(referrerLabel(null)).toBe("");
  });
});

describe("adminRoute", () => {
  it("is never /api, and falls back to /atelier", () => {
    expect(adminRoute("studio-7k")).toBe("/studio-7k");
    expect(adminRoute("/back-office/")).toBe("/back-office");
    expect(adminRoute("api")).toBe("/atelier");
    expect(adminRoute("../x")).toBe("/atelier");
    expect(adminRoute(undefined)).toBe("/atelier");
  });
});
