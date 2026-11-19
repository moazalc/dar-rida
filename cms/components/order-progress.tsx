"use client";

import { Button, toast, useDocumentInfo, useFormFields, useTranslation } from "@payloadcms/ui";
import { useState } from "react";
import { adminLang, shortDate, STATUS_LABEL, t } from "@/cms/admin/i18n";
import { availableActions, CARRIERS, carrierOptions, orderFlags, type Carrier, type OrderAction } from "@/lib/orders/fulfilment";

const STEPS = [
  { status: "paid", date: "paidAt", label: t("Paid", "مدفوع") },
  { status: "in_production", date: "productionStartedAt", label: t("In production", "قيد التنفيذ") },
  { status: "shipped", date: "shippedAt", label: t("Shipped", "تم الشحن") },
  { status: "completed", date: "deliveredAt", label: t("Delivered", "تم التسليم") },
] as const;
const ORDER = ["paid", "in_production", "shipped", "completed"];

const ACTION_LABEL: Record<OrderAction, { en: string; ar: string }> = {
  start: t("Start production", "بدء التنفيذ"),
  ship: t("Mark as shipped", "تأكيد الشحن"),
  deliver: t("Mark delivered", "تأكيد التسليم"),
  cancel: t("Cancel order", "إلغاء الطلب"),
};

const FIELD_ERROR: Record<string, { en: string; ar: string }> = {
  carrier: t("Pick a courier.", "اختر شركة الشحن."),
  trackingNumber: t("Enter the tracking number (letters and digits).", "أدخل رقم التتبّع (أحرف وأرقام)."),
  trackingUrl: t("Paste the courier's tracking link (starting with https://).", "الصق رابط التتبّع (يبدأ بـ https://)."),
  reason: t("Say why the order is cancelled.", "اذكر سبب الإلغاء."),
};

const box = {
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: "var(--style-radius-m, 4px)",
  padding: "20px",
  marginBottom: "24px",
  background: "var(--theme-elevation-0)",
} as const;

/** One value from the order form. */
function useValue<T = string>(path: string): T | undefined {
  return useFormFields(([fields]) => fields[path]?.value as T | undefined);
}

/**
 * The top of an order: where it is (a four-step timeline with dates) and one
 * clear button for the next step. Shipping asks for the courier and tracking
 * number; cancelling asks why. Each step is checked again on the server.
 */
export function OrderProgress() {
  const { id } = useDocumentInfo();
  const lang = adminLang(useTranslation().i18n);
  const status = useValue("status");
  const dates = {
    paidAt: useValue("paidAt"),
    productionStartedAt: useValue("productionStartedAt"),
    shippedAt: useValue("shippedAt"),
    deliveredAt: useValue("deliveredAt"),
  };
  const readyBy = useValue("readyBy");
  const expectedDelivery = useValue("expectedDelivery");
  const carrier = useValue<Carrier>("carrier");
  const trackingNumber = useValue("trackingNumber");
  const trackingUrl = useValue("trackingUrl");
  const cancelledAt = useValue("cancelledAt");
  const cancelReason = useValue("cancelReason");

  const [open, setOpen] = useState<"ship" | "cancel" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ carrier: "" as Carrier | "", trackingNumber: "", trackingUrl: "", reason: "" });

  if (!id || !status || status === "pending_payment") return null;

  const actions = availableActions(status);
  const main = actions.find((a) => a !== "cancel");
  const flags = orderFlags({ status, readyBy, expectedDelivery });
  const reached = ORDER.indexOf(status);

  async function run(action: OrderAction, body: Record<string, string> = {}) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${id}/advance`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...body }),
      });
      const result = (await res.json().catch(() => ({}))) as { error?: string; field?: string; emailed?: boolean };
      if (!res.ok) {
        setError(result.field ? FIELD_ERROR[result.field]?.[lang] ?? result.error ?? "" : result.error || t("That didn't work.", "لم تنجح العملية.")[lang]);
        return;
      }
      if (action === "ship") {
        if (result.emailed) toast.success(t("Shipped. The customer has been emailed.", "تم الشحن وأُرسل بريد للعميلة.")[lang]);
        else toast.warning(t("Shipped, but the email didn't go out. Resend it below.", "تم الشحن، لكن البريد لم يُرسل. أعد إرساله أدناه.")[lang]);
      } else toast.success(STATUS_LABEL[action === "start" ? "in_production" : action === "deliver" ? "completed" : "cancelled"][lang]);
      setTimeout(() => window.location.reload(), 700);
    } catch {
      setError(t("No connection. Try again.", "لا يوجد اتصال. حاول مرة أخرى.")[lang]);
    } finally {
      setBusy(false);
    }
  }

  const input = {
    width: "100%",
    height: 40,
    padding: "0 10px",
    border: "1px solid var(--theme-elevation-250)",
    borderRadius: 4,
    background: "var(--theme-input-bg, var(--theme-elevation-0))",
    color: "var(--theme-text)",
    font: "inherit",
  } as const;

  return (
    <section style={box} aria-label={t("Order progress", "مراحل الطلب")[lang]}>
      {status === "cancelled" ? (
        <p style={{ margin: 0 }}>
          <strong>{STATUS_LABEL.cancelled[lang]}</strong>
          {cancelledAt ? ` · ${shortDate(cancelledAt, lang)}` : ""}
          {cancelReason ? <span style={{ display: "block", marginTop: 6, color: "var(--theme-elevation-600)" }}>{cancelReason}</span> : null}
        </p>
      ) : (
        <ol style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8, listStyle: "none", margin: 0, padding: 0 }}>
          {STEPS.map((s, i) => {
            const done = i <= reached;
            const when = dates[s.date];
            return (
              <li key={s.status} style={{ borderTop: `3px solid ${done ? "var(--dr-ink, #2b2420)" : "var(--theme-elevation-150)"}`, paddingTop: 8 }}>
                <span style={{ display: "block", fontWeight: i === reached ? 600 : 400, color: done ? "var(--theme-text)" : "var(--theme-elevation-500)" }}>
                  {s.label[lang]}
                </span>
                <span style={{ fontSize: 12, color: "var(--theme-elevation-600)" }}>{when ? shortDate(when, lang) : "–"}</span>
              </li>
            );
          })}
        </ol>
      )}

      {status === "in_production" && readyBy ? (
        <p style={{ margin: "16px 0 0", color: flags.late ? "var(--theme-warning-650, #b26b00)" : undefined }}>
          {flags.late
            ? t(`Late: was due ${shortDate(readyBy, lang)}`, `متأخر: كان موعده ${shortDate(readyBy, lang)}`)[lang]
            : t(`Ready by ${shortDate(readyBy, lang)}`, `جاهز بحلول ${shortDate(readyBy, lang)}`)[lang]}
          <span style={{ color: "var(--theme-elevation-500)" }}>
            {" · "}
            {t("change it under “Making and shipping”", "يمكن تعديله في «التنفيذ والشحن»")[lang]}
          </span>
        </p>
      ) : null}

      {(status === "shipped" || status === "completed") && trackingNumber ? (
        <p style={{ margin: "16px 0 0" }}>
          {carrier ? `${CARRIERS[carrier]?.name ?? carrier} · ` : ""}
          <span dir="ltr">{trackingNumber}</span>
          {trackingUrl ? (
            <>
              {" · "}
              <a href={trackingUrl} target="_blank" rel="noopener noreferrer">
                {t("Track", "تتبّع")[lang]} ↗
              </a>
            </>
          ) : null}
          {status === "shipped" && expectedDelivery ? (
            <span style={{ display: "block", marginTop: 4, color: flags.checkOn ? "var(--theme-warning-650, #b26b00)" : "var(--theme-elevation-600)" }}>
              {flags.checkOn
                ? t(`Expected around ${shortDate(expectedDelivery, lang)}. Worth checking on.`, `كان متوقعًا نحو ${shortDate(expectedDelivery, lang)}. يُستحسن المتابعة.`)[lang]
                : t(`Expected around ${shortDate(expectedDelivery, lang)}`, `متوقع نحو ${shortDate(expectedDelivery, lang)}`)[lang]}
            </span>
          ) : null}
        </p>
      ) : null}

      {open === "ship" ? (
        // Not a <form>: this sits inside Payload's own order form, and forms can't nest.
        <div role="group" style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginTop: 20 }}>
          <label style={{ display: "grid", gap: 6 }}>
            {t("Courier", "شركة الشحن")[lang]}
            <select required value={form.carrier} onChange={(e) => setForm({ ...form, carrier: e.target.value as Carrier })} style={input}>
              <option value="" disabled>
                {t("Choose…", "اختر…")[lang]}
              </option>
              {carrierOptions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.value === "other" ? t("Other", "أخرى")[lang] : c.label}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            {t("Tracking number", "رقم التتبّع")[lang]}
            <input required dir="ltr" onKeyDown={(e) => e.key === "Enter" && e.preventDefault()} value={form.trackingNumber} onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })} style={input} />
          </label>
          {form.carrier === "other" ? (
            <label style={{ display: "grid", gap: 6, gridColumn: "1 / -1" }}>
              {t("Tracking link", "رابط التتبّع")[lang]}
              <input
                required
                type="url"
                dir="ltr"
                placeholder="https://"
                onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                value={form.trackingUrl}
                onChange={(e) => setForm({ ...form, trackingUrl: e.target.value })}
                style={input}
              />
            </label>
          ) : null}
          <div style={{ display: "flex", gap: 8, alignItems: "center", gridColumn: "1 / -1", flexWrap: "wrap" }}>
            <Button
              buttonStyle="primary"
              size="medium"
              disabled={busy}
              margin={false}
              onClick={() => void run("ship", { carrier: form.carrier, trackingNumber: form.trackingNumber, trackingUrl: form.trackingUrl })}
            >
              {t("Mark as shipped and email her", "تأكيد الشحن وإرسال بريد للعميلة")[lang]}
            </Button>
            <Button buttonStyle="secondary" size="medium" disabled={busy} margin={false} onClick={() => setOpen(null)}>
              {t("Back", "رجوع")[lang]}
            </Button>
          </div>
        </div>
      ) : open === "cancel" ? (
        <div role="group" style={{ display: "grid", gap: 12, marginTop: 20 }}>
          <label style={{ display: "grid", gap: 6 }}>
            {t("Why is it cancelled?", "سبب الإلغاء")[lang]}
            <textarea required maxLength={500} rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} style={{ ...input, height: "auto", padding: 10 }} />
          </label>
          <p style={{ margin: 0, color: "var(--theme-elevation-600)", fontSize: 13 }}>
            {t(
              "This only marks the order cancelled. No email is sent; refund her in Stripe yourself if needed.",
              "هذا يغيّر حالة الطلب فقط. لا يُرسل بريد، وأي استرداد يتم من Stripe يدويًا.",
            )[lang]}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button buttonStyle="error" size="medium" disabled={busy} margin={false} onClick={() => void run("cancel", { reason: form.reason })}>
              {ACTION_LABEL.cancel[lang]}
            </Button>
            <Button buttonStyle="secondary" size="medium" disabled={busy} margin={false} onClick={() => setOpen(null)}>
              {t("Keep the order", "الإبقاء على الطلب")[lang]}
            </Button>
          </div>
        </div>
      ) : actions.length ? (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 20 }}>
          {main ? (
            <Button
              buttonStyle="primary"
              size="medium"
              disabled={busy}
              margin={false}
              onClick={() => (main === "ship" ? setOpen("ship") : void run(main))}
            >
              {ACTION_LABEL[main][lang]}
            </Button>
          ) : null}
          {actions.includes("cancel") ? (
            <Button buttonStyle="secondary" size="medium" disabled={busy} margin={false} onClick={() => setOpen("cancel")}>
              {ACTION_LABEL.cancel[lang]}
            </Button>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p role="alert" style={{ margin: "12px 0 0", color: "var(--theme-error-500, #c0392b)" }}>
          {error}
        </p>
      ) : null}
    </section>
  );
}

