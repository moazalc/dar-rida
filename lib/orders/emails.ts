import type { Order } from "@/cms/payload-types";
import { describeConfig } from "@/lib/configurator/describe";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { measurementKeys, measurementSpec } from "@/lib/measurements";
import { formatUsd } from "@/lib/money";

// Plain, well-typeset order emails: inline styles and simple tables, which is
// what email clients render reliably, with a text version alongside.

export type Email = { subject: string; html: string; text: string };

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const INK = "#2b2420";
const MUTED = "#7a6f66";
const RULE = "#e6dccb";
const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const SANS = "Jost, 'Helvetica Neue', Arial, sans-serif";

function shell(body: string, dir: "ltr" | "rtl", lang: string) {
  return `<!doctype html><html lang="${lang}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;background:#f7f2e9;color:${INK};font-family:${SANS};font-size:15px;line-height:1.55">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f2e9"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fbf8f2;border:1px solid ${RULE}" dir="${dir}">
<tr><td style="padding:32px 32px 8px;font-family:${SERIF};font-size:26px;letter-spacing:0.12em;text-align:center">DAR RIDA</td></tr>
<tr><td style="padding:16px 32px 32px;text-align:${dir === "rtl" ? "right" : "left"}">${body}</td></tr>
</table></td></tr></table></body></html>`;
}

function measurementsTable(line: NonNullable<Order["lines"]>[number], dict: Dictionary, locale: string) {
  const f = dict.design.sizing.fields;
  const u = dict.design.sizing.units;
  return measurementKeys
    .map(
      (m) =>
        `<tr><td style="padding:2px 0;color:${MUTED}">${esc(f[m].label)}</td><td style="padding:2px 8px">${line.measurements[m].toLocaleString(locale)} ${esc(u[measurementSpec[m].unit])}</td></tr>`,
    )
    .join("");
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

  const paid =
    order.presentmentCurrency && order.presentmentCurrency !== "usd" && order.presentmentAmount
      ? t.paidIn.replace(
          "{amount}",
          new Intl.NumberFormat(locale === "ar" ? "ar-u-nu-latn" : "en", {
            style: "currency",
            currency: order.presentmentCurrency.toUpperCase(),
          }).format(order.presentmentAmount / 100),
        )
      : null;

  const html = shell(
    `<p style="font-family:${SERIF};font-size:30px;margin:0 0 8px">${esc(greeting)}</p>
<p style="margin:0 0 6px">${esc(t.intro)}</p>
${leadTime ? `<p style="margin:0 0 20px;color:${MUTED}">${esc(t.leadTime.replace("{leadTime}", leadTime))}</p>` : ""}
<p style="margin:0 0 12px;font-size:12px;letter-spacing:0.2em;color:${MUTED};text-transform:uppercase">${esc(t.order)} <span dir="ltr">${esc(number)}</span></p>
${lines
  .map(
    ({ line, name, choices }) => `<div style="border-top:1px solid ${RULE};padding:16px 0">
<table role="presentation" width="100%"><tr><td style="font-family:${SERIF};font-size:21px">${esc(name)}</td><td style="text-align:${dir === "rtl" ? "left" : "right"};white-space:nowrap">${esc(formatUsd(line.unitPrice * line.quantity, locale))}</td></tr></table>
${line.quantity > 1 ? `<p style="margin:2px 0;color:${MUTED}">${esc(t.quantity)}: ${line.quantity.toLocaleString(locale)}</p>` : ""}
${choices.map((c) => `<p style="margin:2px 0"><span style="color:${MUTED}">${esc(c.label)}:</span> ${esc(c.value)}</p>`).join("")}
<p style="margin:10px 0 2px;font-size:12px;letter-spacing:0.16em;color:${MUTED};text-transform:uppercase">${esc(t.measurements)}</p>
<table role="presentation" style="font-size:14px">${measurementsTable(line, dict, locale)}</table>
${line.notes ? `<p style="margin:8px 0 0"><span style="color:${MUTED}">${esc(t.notes)}:</span> ${esc(line.notes)}</p>` : ""}
</div>`,
  )
  .join("")}
<table role="presentation" width="100%" style="border-top:1px solid ${INK};padding-top:12px"><tr><td style="font-size:16px">${esc(t.total)}</td><td style="text-align:${dir === "rtl" ? "left" : "right"};font-family:${SERIF};font-size:24px">${esc(formatUsd(order.total, locale))}</td></tr></table>
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
      `${name} — ${formatUsd(line.unitPrice * line.quantity, locale)}${line.quantity > 1 ? ` (${t.quantity}: ${line.quantity})` : ""}`,
      ...choices.map((c) => `${c.label}: ${c.value}`),
      `${t.measurements}: ${measurementKeys
        .map((m) => `${dict.design.sizing.fields[m].label} ${line.measurements[m]} ${dict.design.sizing.units[measurementSpec[m].unit]}`)
        .join(", ")}`,
      line.notes ? `${t.notes}: ${line.notes}` : "",
    ]),
    "",
    `${t.total}: ${formatUsd(order.total, locale)}`,
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
  const total = formatUsd(order.total, "en");
  const subject = `New order ${order.number} — ${count} ${count === 1 ? "piece" : "pieces"} — ${total}`;
  const unit = (m: (typeof measurementKeys)[number]) => measurementSpec[m].unit;
  const label = (m: string) => m.charAt(0).toUpperCase() + m.slice(1);

  const linesHtml = (order.lines ?? [])
    .map(
      (line) => `<div style="border-top:1px solid ${RULE};padding:14px 0">
<p style="margin:0;font-family:${SERIF};font-size:21px">${esc(line.name)} × ${line.quantity}</p>
<p style="margin:2px 0 8px;color:${MUTED}">${esc(formatUsd(line.unitPrice, "en"))} each</p>
${(line.choices ?? []).map((c) => `<p style="margin:2px 0"><span style="color:${MUTED}">${esc(c.label ?? "")}:</span> ${esc(c.value ?? "")}</p>`).join("")}
<table role="presentation" style="font-size:14px;margin-top:6px">${measurementKeys
        .map((m) => `<tr><td style="padding:2px 12px 2px 0;color:${MUTED}">${label(m)}</td><td>${line.measurements[m]} ${unit(m)}</td></tr>`)
        .join("")}</table>
${line.notes ? `<p style="margin:8px 0 0"><span style="color:${MUTED}">Notes:</span> ${esc(line.notes)}</p>` : ""}
</div>`,
    )
    .join("");

  const contact = [order.customerName, order.customerEmail, order.customerPhone].filter((s): s is string => Boolean(s));
  const html = shell(
    `<p style="font-family:${SERIF};font-size:28px;margin:0 0 4px">New order ${esc(order.number ?? "")}</p>
<p style="margin:0 0 18px;color:${MUTED}">${count} ${count === 1 ? "piece" : "pieces"} · ${esc(total)}${order.presentmentCurrency && order.presentmentCurrency !== "usd" && order.presentmentAmount ? ` · paid in ${esc(order.presentmentCurrency.toUpperCase())}` : ""} · ordered in ${order.locale === "ar" ? "Arabic" : "English"}</p>
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
    ...(order.lines ?? []).flatMap((line) => [
      "",
      `${line.name} × ${line.quantity} (${formatUsd(line.unitPrice, "en")} each)`,
      ...(line.choices ?? []).map((c) => `${c.label}: ${c.value}`),
      ...measurementKeys.map((m) => `  ${label(m)}: ${line.measurements[m]} ${unit(m)}`),
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
