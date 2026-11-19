import type { Order } from "@/cms/payload-types";
import { describeConfig } from "@/lib/configurator/describe";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { formatMeasurement, measurementRows, otherUnit, type StoredMeasurements } from "@/lib/measurements";
import { formatMoney, type Currency } from "@/lib/markets";
import { formatMinorUnits } from "@/lib/money";

// Plain, well-typeset order emails: inline styles and simple tables, which is
// what email clients render reliably, with a text version alongside.

export type Email = { subject: string; html: string; text: string };

export const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export const INK = "#2b2420";
export const MUTED = "#7a6f66";
const RULE = "#e6dccb";
export const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const SANS = "Jost, 'Helvetica Neue', Arial, sans-serif";

export function shell(body: string, dir: "ltr" | "rtl", lang: string) {
  return `<!doctype html><html lang="${lang}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;background:#f7f2e9;color:${INK};font-family:${SANS};font-size:15px;line-height:1.55">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f2e9"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fbf8f2;border:1px solid ${RULE}" dir="${dir}">
<tr><td style="padding:32px 32px 8px;font-family:${SERIF};font-size:26px;letter-spacing:0.12em;text-align:center">DAR RIDA</td></tr>
<tr><td style="padding:16px 32px 32px;text-align:${dir === "rtl" ? "right" : "left"}">${body}</td></tr>
</table></td></tr></table></body></html>`;
}

/** The customer's measurements exactly as they entered them, in their language. */
function customerMeasurements(set: StoredMeasurements, dict: Dictionary, locale: string) {
  return measurementRows(set).map((r) => ({
    label: dict.measure.fields[r.key].label,
    value: formatMeasurement(r.key, r.value, r.unit, locale, dict.measure.units),
  }));
}

function measurementsTable(line: NonNullable<Order["lines"]>[number], dict: Dictionary, locale: string) {
  return customerMeasurements(line.measurements, dict, locale)
    .map((r) => `<tr><td style="padding:2px 0;color:${MUTED}">${esc(r.label)}</td><td style="padding:2px 8px">${esc(r.value)}</td></tr>`)
    .join("");
}

const ownerLabels = { height: "Height", length: "Length", shoulder: "Shoulder width", bust: "Bust", sleeve: "Sleeve length", hips: "Hips" };

/** For the workshop: the value as entered, with the other unit alongside for reference only. */
function ownerMeasurements(set: StoredMeasurements) {
  return measurementRows(set).map((r) => ({
    label: ownerLabels[r.key],
    value: formatMeasurement(r.key, r.value, r.unit, "en"),
    other: otherUnit(r.key, r.value, r.unit, "en"),
  }));
}

/** Amounts in the order's own currency (orders from before markets are dollars). */
function moneyFor(order: Order) {
  const currency: Currency = order.currency === "aed" ? "aed" : "usd";
  return (minor: number) => formatMoney(minor, currency);
}

/** Paid in another currency than the order's, through Stripe's local-currency prices. */
function paidElsewhere(order: Order): boolean {
  return Boolean(order.presentmentCurrency && order.presentmentAmount && order.presentmentCurrency !== (order.currency || "usd"));
}

function address(order: Order): string[] {
  const a = order.shippingAddress;
  if (!a) return [];
  return [order.customerName, a.line1, a.line2, [a.city, a.state, a.postalCode].filter(Boolean).join(" "), a.country].filter(
    (s): s is string => Boolean(s && s.trim()),
  );
}

/** The confirmation the customer receives, in the language they ordered in. */
export function customerEmail(order: Order, dict: Dictionary, leadTime: string | null): Email {
  const t = dict.orderEmail;
  const locale = order.locale === "ar" ? "ar" : "en";
  const dir = locale === "ar" ? "rtl" : "ltr";
  const number = order.number ?? "";
  const first = order.customerName?.trim().split(/\s+/)[0];
  const greeting = first ? t.greeting.replace("{name}", first) : t.greetingNoName;

  const lines = (order.lines ?? []).map((line) => {
    const name = locale === "ar" && line.nameAr ? line.nameAr : line.kind === "custom" ? dict.cart.customName : line.name;
    const choices = line.kind === "custom" ? describeConfig(line.config, dict) : [];
    return { line, name, choices };
  });

  const money = moneyFor(order);
  const paid = paidElsewhere(order)
    ? t.paidIn.replace("{amount}", formatMinorUnits(order.presentmentAmount!, order.presentmentCurrency!, locale))
    : null;
  const shipping = order.shipping ? money(order.shipping) : order.shippingZone ? t.shippingFree : null;

  const html = shell(
    `<p style="font-family:${SERIF};font-size:30px;margin:0 0 8px">${esc(greeting)}</p>
<p style="margin:0 0 6px">${esc(t.intro)}</p>
${leadTime ? `<p style="margin:0 0 20px;color:${MUTED}">${esc(t.leadTime.replace("{leadTime}", leadTime))}</p>` : ""}
<p style="margin:0 0 12px;font-size:12px;letter-spacing:0.2em;color:${MUTED};text-transform:uppercase">${esc(t.order)} <span dir="ltr">${esc(number)}</span></p>
${lines
  .map(
    ({ line, name, choices }) => `<div style="border-top:1px solid ${RULE};padding:16px 0">
<table role="presentation" width="100%"><tr><td style="font-family:${SERIF};font-size:21px">${esc(name)}</td><td style="text-align:${dir === "rtl" ? "left" : "right"};white-space:nowrap">${esc(money(line.unitPrice * line.quantity))}</td></tr></table>
${line.quantity > 1 ? `<p style="margin:2px 0;color:${MUTED}">${esc(t.quantity)}: ${line.quantity.toLocaleString(locale)}</p>` : ""}
${choices.map((c) => `<p style="margin:2px 0"><span style="color:${MUTED}">${esc(c.label)}:</span> ${esc(c.value)}</p>`).join("")}
<p style="margin:10px 0 2px;font-size:12px;letter-spacing:0.16em;color:${MUTED};text-transform:uppercase">${esc(t.measurements)}</p>
<table role="presentation" style="font-size:14px">${measurementsTable(line, dict, locale)}</table>
${line.notes ? `<p style="margin:8px 0 0"><span style="color:${MUTED}">${esc(t.notes)}:</span> ${esc(line.notes)}</p>` : ""}
</div>`,
  )
  .join("")}
${shipping ? `<table role="presentation" width="100%" style="border-top:1px solid ${RULE};padding:10px 0 4px"><tr><td>${esc(t.shipping)}</td><td style="text-align:${dir === "rtl" ? "left" : "right"}">${esc(shipping)}</td></tr></table>` : ""}
<table role="presentation" width="100%" style="border-top:1px solid ${INK};padding-top:12px"><tr><td style="font-size:16px">${esc(t.total)}</td><td style="text-align:${dir === "rtl" ? "left" : "right"};font-family:${SERIF};font-size:24px">${esc(money(order.total))}</td></tr></table>
${paid ? `<p style="margin:4px 0 0;color:${MUTED};font-size:13px">${esc(paid)}</p>` : ""}
${address(order).length ? `<p style="margin:24px 0 4px;font-size:12px;letter-spacing:0.16em;color:${MUTED};text-transform:uppercase">${esc(t.shipTo)}</p><p style="margin:0">${address(order).map(esc).join("<br>")}</p>` : ""}
<p style="margin:28px 0 0">${esc(t.questions)}</p>
<p style="margin:16px 0 0;font-family:${SERIF};font-size:18px">${esc(t.signoff).replace(/\n/g, "<br>")}</p>`,
    dir,
    locale,
  );

  const text = [
    greeting,
    t.intro,
    leadTime ? t.leadTime.replace("{leadTime}", leadTime) : "",
    "",
    `${t.order} ${number}`,
    ...lines.flatMap(({ line, name, choices }) => [
      "",
      `${name} — ${money(line.unitPrice * line.quantity)}${line.quantity > 1 ? ` (${t.quantity}: ${line.quantity})` : ""}`,
      ...choices.map((c) => `${c.label}: ${c.value}`),
      `${t.measurements}: ${customerMeasurements(line.measurements, dict, locale)
        .map((r) => `${r.label} ${r.value}`)
        .join(", ")}`,
      line.notes ? `${t.notes}: ${line.notes}` : "",
    ]),
    "",
    shipping ? `${t.shipping}: ${shipping}` : "",
    `${t.total}: ${money(order.total)}`,
    paid ?? "",
    "",
    ...(address(order).length ? [t.shipTo, ...address(order), ""] : []),
    t.questions,
    "",
    t.signoff,
  ]
    .filter((l, i, all) => !(l === "" && all[i - 1] === ""))
    .join("\n");

  return { subject: t.subject.replace("{number}", number), html, text };
}

/** The notice the owners receive: everything the workshop needs, in English. */
export function ownerEmail(order: Order, adminUrl: string): Email {
  const count = (order.lines ?? []).reduce((n, l) => n + l.quantity, 0);
  const money = moneyFor(order);
  const total = money(order.total);
  const shipping = `Shipping${order.shippingZone ? ` (${order.shippingZone})` : ""}: ${order.shipping ? money(order.shipping) : "free"}`;
  const market = order.market === "uae" ? "UAE prices (AED)" : "global prices (USD)";
  const subject = `New order ${order.number} — ${count} ${count === 1 ? "piece" : "pieces"} — ${total}`;

  const linesHtml = (order.lines ?? [])
    .map(
      (line) => `<div style="border-top:1px solid ${RULE};padding:14px 0">
<p style="margin:0;font-family:${SERIF};font-size:21px">${esc(line.name)} × ${line.quantity}</p>
<p style="margin:2px 0 8px;color:${MUTED}">${esc(money(line.unitPrice))} each</p>
${(line.choices ?? []).map((c) => `<p style="margin:2px 0"><span style="color:${MUTED}">${esc(c.label ?? "")}:</span> ${esc(c.value ?? "")}</p>`).join("")}
<table role="presentation" style="font-size:14px;margin-top:6px">${ownerMeasurements(line.measurements)
        .map((r) => `<tr><td style="padding:2px 12px 2px 0;color:${MUTED}">${r.label}</td><td><strong>${esc(r.value)}</strong></td><td style="padding-left:12px;color:${MUTED}">${esc(r.other)}</td></tr>`)
        .join("")}</table>
${line.notes ? `<p style="margin:8px 0 0"><span style="color:${MUTED}">Notes:</span> ${esc(line.notes)}</p>` : ""}
</div>`,
    )
    .join("");

  const contact = [order.customerName, order.customerEmail, order.customerPhone].filter((s): s is string => Boolean(s));
  const html = shell(
    `<p style="font-family:${SERIF};font-size:28px;margin:0 0 4px">New order ${esc(order.number ?? "")}</p>
<p style="margin:0 0 18px;color:${MUTED}">${count} ${count === 1 ? "piece" : "pieces"} · ${esc(total)}${paidElsewhere(order) ? ` · paid in ${esc(order.presentmentCurrency!.toUpperCase())}` : ""} · ordered in ${order.locale === "ar" ? "Arabic" : "English"}</p>
<p style="margin:0 0 18px;color:${MUTED}">${esc(market)} · ${esc(shipping)}</p>
${linesHtml}
<p style="margin:20px 0 4px;font-size:12px;letter-spacing:0.16em;color:${MUTED};text-transform:uppercase">Customer</p>
<p style="margin:0">${contact.map(esc).join("<br>")}</p>
<p style="margin:16px 0 4px;font-size:12px;letter-spacing:0.16em;color:${MUTED};text-transform:uppercase">Ship to</p>
<p style="margin:0">${address(order).map(esc).join("<br>")}</p>
<p style="margin:24px 0 0"><a href="${esc(adminUrl)}" style="color:${INK}">Open the order in the admin</a></p>`,
    "ltr",
    "en",
  );

  const text = [
    `New order ${order.number}`,
    `${count} ${count === 1 ? "piece" : "pieces"} · ${total}`,
    `${market} · ${shipping}`,
    ...(order.lines ?? []).flatMap((line) => [
      "",
      `${line.name} × ${line.quantity} (${money(line.unitPrice)} each)`,
      ...(line.choices ?? []).map((c) => `${c.label}: ${c.value}`),
      ...ownerMeasurements(line.measurements).map((r) => `  ${r.label}: ${r.value} (${r.other})`),
      line.notes ? `Notes: ${line.notes}` : "",
    ]),
    "",
    "Customer:",
    ...contact,
    "",
    "Ship to:",
    ...address(order),
    "",
    adminUrl,
  ].join("\n");

  return { subject, html, text };
}
