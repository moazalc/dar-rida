import { describe, expect, it } from "vitest";
import type { Order } from "@/cms/payload-types";
import { exportFileName, exportWhere, orderExportRows, toCsv } from "@/lib/orders/export";

const order = (over: Partial<Order> = {}): Order =>
  ({
    id: 1,
    number: "DR-1001",
    status: "in_production",
    readyBy: "2026-12-01T08:00:00.000Z",
    paidAt: "2026-11-19T21:30:00.000Z", // 20 Nov in Dubai
    customerName: "Sara Ali",
    customerEmail: "sara@example.com",
    customerPhone: "+971 50 123 4567",
    shippingCountry: "AE",
    currency: "aed",
    subtotal: 300000,
    total: 300000,
    lines: [
      {
        kind: "design",
        name: "RIDA 01 · The Classic",
        nameAr: "RIDA 01 · الكلاسيكية",
        quantity: 2,
        unitPrice: 150000,
        design: { id: 3, code: "RIDA 01" } as never,
        measurements: { unit: "cm", length: 140, shoulder: 40, bust: 92, waist: 76, hips: 100, sleeve: 58 },
        notes: "Slightly wider sleeves",
      },
      {
        kind: "design",
        name: "RIDA 02 · Evening",
        quantity: 1,
        unitPrice: 0,
        design: 4,
        measurements: { unit: "in", length: 55, shoulder: 15.5, bust: 36, waist: 30, hips: 40, sleeve: 23 },
      },
    ],
    createdAt: "2026-11-19T21:00:00.000Z",
    updatedAt: "2026-11-19T21:00:00.000Z",
    ...over,
  }) as Order;

describe("orderExportRows", () => {
  it("writes one row per piece, repeating the order details", () => {
    const [head, first, second] = orderExportRows([order()], "en");
    expect(head.slice(0, 3)).toEqual(["Order", "Date", "Status"]);
    expect(first.slice(0, 11)).toEqual([
      "DR-1001",
      "2026-11-20",
      "In production",
      "2026-12-01",
      "Sara Ali",
      "sara@example.com",
      "+971 50 123 4567",
      "AE",
      "RIDA 01",
      "RIDA 01 · The Classic",
      "2",
    ]);
    expect(first.slice(11)).toEqual(["140", "40", "92", "76", "100", "58", "cm", "Slightly wider sleeves", "3000.00", "3000.00", "AED"]);
    expect(second[0]).toBe("DR-1001");
    expect(second[8]).toBe(""); // design not loaded: no code, the name still carries it
    expect(second.slice(11, 18)).toEqual(["55", "15.5", "36", "30", "40", "23", "in"]);
    expect(head).toHaveLength(first.length);
  });

  it("uses Arabic headings, statuses and piece names for an Arabic admin", () => {
    const [head, first, second] = orderExportRows([order()], "ar");
    expect(head[0]).toBe("الطلب");
    expect(first[2]).toBe("قيد التنفيذ");
    expect(first[9]).toBe("RIDA 01 · الكلاسيكية");
    expect(second[9]).toBe("RIDA 02 · Evening"); // no Arabic name saved: falls back to English
  });

  it("still lists an order without pieces", () => {
    const rows = orderExportRows([order({ lines: [] })], "en");
    expect(rows).toHaveLength(2);
    expect(rows[1]).toHaveLength(rows[0].length);
    expect(rows[1].at(-1)).toBe("AED");
  });
});

describe("toCsv", () => {
  it("starts with a byte-order mark and quotes commas, quotes and line breaks", () => {
    const csv = toCsv([["a,b", 'say "hi"', "two\nlines", "plain"]]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv.slice(1)).toBe('"a,b","say ""hi""","two\nlines",plain\r\n');
  });

  it("keeps Arabic as it is", () => {
    expect(toCsv([["عباية"]])).toBe("﻿عباية\r\n");
  });

  it("stops formulas but leaves phone numbers and negatives alone", () => {
    const csv = toCsv([["=HYPERLINK(\"x\")", "@SUM(A1)", "+cmd", "+971 50 123 4567", "-12.5"]]).slice(1);
    expect(csv).toBe(`"'=HYPERLINK(""x"")",'@SUM(A1),'+cmd,+971 50 123 4567,-12.5\r\n`);
  });
});

describe("exportWhere", () => {
  it("always leaves out abandoned checkouts", () => {
    expect(exportWhere(undefined, undefined)).toEqual({ and: [{ status: { not_equals: "pending_payment" } }] });
  });

  it("adds the list's filter and its search box", () => {
    const where = exportWhere({ status: { equals: "shipped" } }, "  sara ");
    expect(where.and).toEqual([
      { status: { not_equals: "pending_payment" } },
      { status: { equals: "shipped" } },
      { or: [{ number: { like: "sara" } }, { customerName: { like: "sara" } }, { customerEmail: { like: "sara" } }] },
    ]);
  });

  it("ignores a filter that isn't an object", () => {
    expect(exportWhere("status=paid", "")).toEqual({ and: [{ status: { not_equals: "pending_payment" } }] });
  });
});

it("names the file after the day in Dubai", () => {
  expect(exportFileName(new Date("2026-11-22T21:00:00Z"))).toBe("dar-rida-orders-2026-11-23.csv");
});
