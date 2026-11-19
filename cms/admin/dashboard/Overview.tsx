import type { WidgetServerProps } from "payload";
import { formatAdminURL } from "payload/shared";
import { formatOrderMoney } from "../../fields";
import { adminLang, counted, intlLocale, shortDate, t, type AdminLang } from "../i18n";
import { type Analytics, changeNote, loadAnalytics } from "./analytics";
import { loadShopDashboard, type QueueOrder } from "./data";
import { barWidths, dayDistance, dubaiDateLine, dubaiGreeting, formatNumber, percentChange } from "./format";
import { averageOrder, type CurrencyTotal } from "./periods";

const money = (minor: number, currency: string) => formatOrderMoney(minor, currency);

function countryName(code: string | null, lang: AdminLang): string {
  if (!code) return "–";
  try {
    return new Intl.DisplayNames([intlLocale(lang)], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

type QueueKind = "fresh" | "making" | "shipped";

const QUEUE_TEXT: Record<QueueKind, { title: { en: string; ar: string }; empty: { en: string; ar: string }; when: { en: string; ar: string } }> = {
  fresh: {
    title: t("New: start production", "جديد: ابدأ التنفيذ"),
    empty: t("No new orders waiting.", "لا طلبات جديدة بانتظار التنفيذ."),
    when: t("Paid", "الدفع"),
  },
  making: {
    title: t("In production", "قيد التنفيذ"),
    empty: t("Nothing being made right now.", "لا شيء قيد التنفيذ الآن."),
    when: t("Ready by", "جاهز بحلول"),
  },
  shipped: {
    title: t("Shipped: mark delivered", "تم الشحن: أكّد التسليم"),
    empty: t("No parcels on their way.", "لا طرود في الطريق."),
    when: t("Expected", "التسليم المتوقع"),
  },
};

function Queue({
  kind,
  total,
  orders,
  href,
  lang,
  now,
}: {
  kind: QueueKind;
  total: number;
  orders: QueueOrder[];
  href: string;
  lang: AdminLang;
  now: Date;
}) {
  const text = QUEUE_TEXT[kind];
  return (
    <div className="dr-dash__card">
      <div className="dr-dash__card-head">
        <h2 className="dr-dash__title">
          {text.title[lang]} <span className="dr-dash__count">{formatNumber(total, lang)}</span>
        </h2>
        {total > orders.length ? (
          <a className="dr-dash__link" href={href}>
            {t("See all", "عرض الكل")[lang]}
          </a>
        ) : null}
      </div>
      {orders.length ? (
        <ul className="dr-dash__list">
          {orders.map((o) => {
            const when = kind === "fresh" ? o.paidAt : kind === "making" ? o.readyBy : o.expectedDelivery;
            const alert = (kind === "making" && o.late) || (kind === "shipped" && o.checkOn);
            return (
              <li key={o.id}>
                <a className="dr-dash__order" href={`${href.split("?")[0]}/${o.id}`}>
                  <span className="dr-dash__order-main">
                    <span className="dr-dash__order-number">{o.number}</span>
                    <span className="dr-dash__muted dr-dash__ellipsis">
                      {o.customer} · {countryName(o.country, lang)}
                    </span>
                  </span>
                  <span className="dr-dash__order-side">
                    <span>{money(o.total, o.currency)}</span>
                    <span className={alert ? "dr-dash__alert" : "dr-dash__muted"}>
                      {when ? `${text.when[lang]} ${kind === "fresh" ? dayDistance(when, now, lang) : shortDate(when, lang)}` : "–"}
                      {alert ? ` · ${(kind === "making" ? t("late", "متأخر") : t("check on it", "تابِعه"))[lang]}` : ""}
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="dr-dash__muted">{text.empty[lang]}</p>
      )}
    </div>
  );
}

function SalesCard({ thisMonth, lastMonth, lang }: { thisMonth: CurrencyTotal[]; lastMonth: CurrencyTotal[]; lang: AdminLang }) {
  const currencies = [...new Set([...thisMonth, ...lastMonth].map((c) => c.currency))];
  const find = (list: CurrencyTotal[], c: string) => list.find((x) => x.currency === c) ?? { currency: c, orders: 0, revenue: 0 };
  return (
    <div className="dr-dash__card">
      <h2 className="dr-dash__title">{t("Sales this month", "مبيعات هذا الشهر")[lang]}</h2>
      {currencies.length ? (
        <ul className="dr-dash__list">
          {currencies.map((c) => {
            const now = find(thisMonth, c);
            const before = find(lastMonth, c);
            const change = percentChange(now.revenue, before.revenue);
            return (
              <li key={c} className="dr-dash__sales">
                <span className="dr-dash__sales-value">{money(now.revenue, c)}</span>
                <span className="dr-dash__muted">
                  {counted(now.orders, "order", lang)}
                  {now.orders ? ` · ${t("average", "المتوسط")[lang]} ${money(averageOrder(now), c)}` : ""}
                </span>
                <span className="dr-dash__muted">
                  {t("Last month", "الشهر الماضي")[lang]}: {money(before.revenue, c)}
                  {change ? <bdi> ({change})</bdi> : null}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="dr-dash__muted">{t("No sales yet this month or last.", "لا مبيعات هذا الشهر أو الماضي بعد.")[lang]}</p>
      )}
      <p className="dr-dash__foot">
        {t(
          "Paid orders, not cancelled. AED and USD are never converted or added together.",
          "الطلبات المدفوعة غير الملغاة. لا يُحوَّل الدرهم والدولار ولا يُجمعان معًا.",
        )[lang]}
      </p>
    </div>
  );
}

function VisitorsCard({ a, lang }: { a: Analytics; lang: AdminLang }) {
  if (a.status !== "ok") {
    return (
      <div className="dr-dash__card">
        <h2 className="dr-dash__title">{t("Visitors", "الزوار")[lang]}</h2>
        <p className="dr-dash__muted">
          {(a.status === "off"
            ? t("Analytics not connected yet (Umami).", "لم تُربط أداة التحليلات (Umami) بعد.")
            : t("Analytics unavailable right now.", "التحليلات غير متاحة حاليًا."))[lang]}
        </p>
      </div>
    );
  }
  const heights = barWidths(a.weeks.map((w) => w.visitors));
  const list = (rows: { label: string; count: number }[], empty: string) =>
    rows.length ? (
      <ul className="dr-dash__list">
        {rows.map((r) => (
          <li className="dr-dash__row-item" key={r.label}>
            <span className="dr-dash__ellipsis">{r.label || t("Direct or unknown", "مباشر أو غير معروف")[lang]}</span>
            <span>{formatNumber(r.count, lang)}</span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="dr-dash__muted">{empty}</p>
    );
  return (
    <>
      <div className="dr-dash__card">
        <h2 className="dr-dash__title">{t("Visitors, last 7 days", "الزوار في آخر 7 أيام")[lang]}</h2>
        <p className="dr-dash__big">{formatNumber(a.visitors7, lang)}</p>
        <p className="dr-dash__muted">{changeNote(a.visitors7, a.visitorsPrev7, lang)}</p>
        <ol className="dr-dash__weeks" aria-label={t("Visitors per week", "الزوار أسبوعيًا")[lang]}>
          {a.weeks.map((w, i) => (
            <li key={w.start} title={`${w.start}: ${formatNumber(w.visitors, lang)}`}>
              <span className="dr-dash__week-bar" style={{ height: `${heights[i]}%` }} />
            </li>
          ))}
        </ol>
      </div>
      <div className="dr-dash__card">
        <h2 className="dr-dash__title">{t("Most visited pages", "الصفحات الأكثر زيارة")[lang]}</h2>
        {list(a.pages, t("No page views yet.", "لا مشاهدات بعد.")[lang])}
        <p className="dr-dash__foot">{t("Last 30 days", "آخر 30 يومًا")[lang]}</p>
      </div>
      <div className="dr-dash__card">
        <h2 className="dr-dash__title">{t("Where visitors come from", "من أين يأتي الزوار")[lang]}</h2>
        {list(a.referrers, t("No visits yet.", "لا زيارات بعد.")[lang])}
        <h3 className="dr-dash__subtitle">{t("Countries", "الدول")[lang]}</h3>
        {list(
          a.countries.map((c) => ({ label: countryName(c.code, lang), count: c.count })),
          t("No visits yet.", "لا زيارات بعد.")[lang],
        )}
        <p className="dr-dash__foot">{t("Last 30 days", "آخر 30 يومًا")[lang]}</p>
      </div>
    </>
  );
}

/**
 * The admin home: orders to act on first, then sales (by currency, by country,
 * best sellers), then visitors from Umami. Rendered on the server on each visit.
 */
export async function Overview({ req }: WidgetServerProps) {
  const adminRoute = req.payload.config.routes.admin;
  const lang = adminLang(req.i18n);
  const now = new Date();
  const [d, a] = await Promise.all([loadShopDashboard(req, now), loadAnalytics(now)]);
  const orders = formatAdminURL({ adminRoute, path: "/collections/orders" });
  const tab = (status: string) => `${orders}?where[status][equals]=${status}`;
  const sellerWidths = barWidths(d.bestSellers.map((b) => b.pieces));
  const thisYear = new Intl.DateTimeFormat(intlLocale(lang), { year: "numeric", timeZone: "Asia/Dubai" }).format(now);

  return (
    <div className="dr-dash">
      <header className="dr-dash__head">
        <div>
          <p className="dr-dash__date">{dubaiDateLine(now, lang)}</p>
          <h1 className="dr-dash__greeting">{dubaiGreeting(now, lang)}</h1>
        </div>
        <div className="dr-dash__actions">
          <a className="dr-dash__btn" href="/" target="_blank" rel="noopener">
            {t("View shop", "عرض المتجر")[lang]}
          </a>
          <a className="dr-dash__btn dr-dash__btn--primary" href={orders}>
            {t("All orders", "كل الطلبات")[lang]}
          </a>
        </div>
      </header>

      <section className="dr-dash__kpis" aria-label={t("Orders to act on", "طلبات تحتاج إجراء")[lang]}>
        <a className="dr-dash__card dr-dash__kpi" href={tab("paid")}>
          <span className="dr-dash__kpi-label">{t("New orders", "طلبات جديدة")[lang]}</span>
          <span className="dr-dash__kpi-value">{formatNumber(d.queues.fresh.total, lang)}</span>
          <span className="dr-dash__kpi-note">
            {d.queues.fresh.orders[0]?.paidAt
              ? t(`Oldest paid ${dayDistance(d.queues.fresh.orders[0].paidAt, now)}`, `أقدمها دُفع ${dayDistance(d.queues.fresh.orders[0].paidAt, now, "ar")}`)[lang]
              : t("Nothing waiting", "لا شيء بالانتظار")[lang]}
          </span>
        </a>
        <a className="dr-dash__card dr-dash__kpi" href={tab("in_production")}>
          <span className="dr-dash__kpi-label">{t("In production", "قيد التنفيذ")[lang]}</span>
          <span className="dr-dash__kpi-value">{formatNumber(d.queues.making.total, lang)}</span>
          <span className={`dr-dash__kpi-note${d.queues.making.late ? " dr-dash__alert" : ""}`}>
            {d.queues.making.late ? counted(d.queues.making.late, "late", lang) : t("All on time", "كلها في موعدها")[lang]}
          </span>
        </a>
        <a className="dr-dash__card dr-dash__kpi" href={tab("shipped")}>
          <span className="dr-dash__kpi-label">{t("On their way", "في الطريق")[lang]}</span>
          <span className="dr-dash__kpi-value">{formatNumber(d.queues.shipped.total, lang)}</span>
          <span className={`dr-dash__kpi-note${d.queues.shipped.checkOn ? " dr-dash__alert" : ""}`}>
            {d.queues.shipped.checkOn
              ? t(`${d.queues.shipped.checkOn} to check on`, `${d.queues.shipped.checkOn} تحتاج متابعة`)[lang]
              : t("Nothing overdue", "لا شيء متأخر")[lang]}
          </span>
        </a>
      </section>

      <section className="dr-dash__row">
        <Queue kind="fresh" total={d.queues.fresh.total} orders={d.queues.fresh.orders} href={tab("paid")} lang={lang} now={now} />
        <Queue kind="making" total={d.queues.making.total} orders={d.queues.making.orders} href={tab("in_production")} lang={lang} now={now} />
        <Queue kind="shipped" total={d.queues.shipped.total} orders={d.queues.shipped.orders} href={tab("shipped")} lang={lang} now={now} />
      </section>

      <section className="dr-dash__row">
        <SalesCard thisMonth={d.sales.thisMonth} lastMonth={d.sales.lastMonth} lang={lang} />
        <div className="dr-dash__card">
          <h2 className="dr-dash__title">{t(`Sales by country, ${thisYear}`, `المبيعات حسب الدولة، ${thisYear}`)[lang]}</h2>
          {d.countries.length ? (
            <table className="dr-table">
              <tbody>
                {d.countries.map((c) => (
                  <tr key={`${c.country}-${c.currency}`}>
                    <td>{countryName(c.country || null, lang)}</td>
                    <td className="dr-dash__muted">{counted(c.orders, "order", lang)}</td>
                    <td className="dr-num">{money(c.revenue, c.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="dr-dash__muted">{t("No sales yet this year.", "لا مبيعات هذا العام بعد.")[lang]}</p>
          )}
        </div>
        <div className="dr-dash__card">
          <h2 className="dr-dash__title">{t(`Best sellers, ${thisYear}`, `الأكثر مبيعًا، ${thisYear}`)[lang]}</h2>
          {d.bestSellers.length ? (
            <ul className="dr-dash__bars">
              {d.bestSellers.map((b, i) => (
                <li key={`${b.custom}-${b.designId}-${b.name}`}>
                  <span className="dr-dash__bar-label">
                    <span>{b.custom ? t("Custom abaya", "عباية مخصّصة")[lang] : b.name}</span>
                    <span>{counted(b.pieces, "piece", lang)}</span>
                  </span>
                  <span className="dr-dash__bar-track" aria-hidden="true">
                    <span className="dr-dash__bar" style={{ width: `${sellerWidths[i]}%` }} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="dr-dash__muted">{t("No pieces sold yet this year.", "لم تُبع قطع هذا العام بعد.")[lang]}</p>
          )}
        </div>
      </section>

      <section className="dr-dash__row">
        <VisitorsCard a={a} lang={lang} />
      </section>
    </div>
  );
}
