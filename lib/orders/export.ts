// The order list as a spreadsheet: one row per piece, so the workshop can plan
// from it. Pure functions, shared by the export endpoint and the tests.

import type { Where } from "payload";
import type { Design, Order } from "@/cms/payload-types";
import { STATUS_LABEL, t, type AdminLang, type Text } from "@/cms/admin/i18n";
import { measurementKeys } from "@/lib/measurements";

/** Never exported, never listed: an order opened at checkout that Stripe never confirmed. */
export const NOT_ABANDONED: Where = { status: { not_equals: "pending_payment" } };

/** The fields the admin's search box looks in (the Orders collection's `listSearchableFields`). */
export const SEARCH_FIELDS = ["number", "customerName", "customerEmail"] as const;

/**
 * The same orders the list shows: its `where` (tab and filters) and its search
 * box, minus abandoned checkouts. `where` comes from the request's query and is
 * passed on to Payload, which checks every field and operator in it.
 */
export function exportWhere(where: unknown, search: unknown): Where {
  const and: Where[] = [NOT_ABANDONED];
  if (where && typeof where === "object" && !Array.isArray(where) && Object.keys(where).length) and.push(where as Where);
  const term = typeof search === "string" ? search.trim() : "";
  if (term) and.push({ or: SEARCH_FIELDS.map((field) => ({ [field]: { like: term } })) });
  return { and };
}

/** As the shop names them (lib/i18n dictionaries), so the team and the customer say the same thing. */
export const MEASUREMENT_LABEL: Record<(typeof measurementKeys)[number], Text> = {
  height: t("Height", "الطول الكامل"),
  length: t("Length", "الطول"),
  shoulder: t("Shoulder width", "عرض الكتفين"),
  bust: t("Bust", "الصدر"),
  sleeve: t("Sleeve length", "طول الكُمّ"),
  hips: t("Hips", "الورك"),
};

export const UNIT_LABEL: Record<string, Text> = {
  in: t("in", "إنش"),
  cm: t("cm", "سم"),
  legacy: t("in (height cm)", "إنش (الطول سم)"),
};

const HEADERS: Text[] = [
  t("Order", "الطلب"),
  t("Date", "التاريخ"),
  t("Status", "الحالة"),
  t("Ready by", "جاهز بتاريخ"),
  t("Customer", "العميلة"),
  t("Email", "البريد"),
  t("Phone", "الهاتف"),
  t("Country", "الدولة"),
  t("Design code", "رمز التصميم"),
  t("Piece", "القطعة"),
  t("Quantity", "الكمية"),
  ...measurementKeys.map((m) => MEASUREMENT_LABEL[m]),
  t("Unit", "الوحدة"),
  t("Notes", "ملاحظات"),
  t("Line price", "سعر البند"),
  t("Order total", "إجمالي الطلب"),
  t("Currency", "العملة"),
];

/** "2026-11-19" in Dubai time: sorts and filters cleanly in Excel. */
function isoDay(when: string | null | undefined): string {
  if (!when) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(when));
}

/** Minor units as a plain number with two decimals ("1500.00"), so Excel can add them up. */
const amount = (minor: number | null | undefined) => (typeof minor === "number" ? (minor / 100).toFixed(2) : "");

/** One row per piece; an order without lines still gets one row. */
export function orderExportRows(orders: Order[], lang: AdminLang): string[][] {
  const rows: string[][] = [HEADERS.map((h) => h[lang])];
  for (const order of orders) {
    const head = [
      order.number ?? "",
      isoDay(order.paidAt ?? order.createdAt),
      STATUS_LABEL[order.status]?.[lang] ?? order.status,
      isoDay(order.readyBy),
      order.customerName ?? "",
      order.customerEmail ?? "",
      order.customerPhone ?? "",
      order.shippingCountry ?? "",
    ];
    const tail = [amount(order.total), (order.currency ?? "").toUpperCase()];
    const lines = order.lines ?? [];
    if (!lines.length) {
      rows.push([...head, ...Array(HEADERS.length - head.length - tail.length).fill(""), ...tail]);
      continue;
    }
    for (const line of lines) {
      const design = typeof line.design === "object" && line.design ? (line.design as Design) : null;
      const m = line.measurements;
      rows.push([
        ...head,
        design?.code ?? "",
        (lang === "ar" && line.nameAr) || line.name,
        String(line.quantity),
        ...measurementKeys.map((k) => (typeof m?.[k] === "number" ? String(m[k]) : "")),
        m?.unit ? UNIT_LABEL[m.unit]?.[lang] ?? m.unit : "",
        line.notes ?? "",
        amount(line.unitPrice * line.quantity),
        ...tail,
      ]);
    }
  }
  return rows;
}

/**
 * A cell Excel would run as a formula ("=HYPERLINK(…)" typed into a note) gets
 * a leading apostrophe. Phone numbers such as "+971 50…" and negative numbers
 * are left alone.
 */
function defuse(cell: string): string {
  if (/^[=@\t\r]/.test(cell) || /^[+-](?![\d\s.]*$)/.test(cell)) return `'${cell}`;
  return cell;
}

function quote(cell: string): string {
  const safe = defuse(cell);
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** RFC 4180 CSV with a UTF-8 byte-order mark, so Excel opens Arabic correctly. */
export function toCsv(rows: string[][]): string {
  return "﻿" + rows.map((row) => row.map(quote).join(",")).join("\r\n") + "\r\n";
}

/** "dar-rida-orders-2026-11-22.csv" */
export function exportFileName(now = new Date()): string {
  return `dar-rida-orders-${isoDay(now.toISOString())}.csv`;
}
