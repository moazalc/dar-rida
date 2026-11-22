import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { shortDate, t } from "@/cms/admin/i18n";
import type { Design, Order } from "@/cms/payload-types";
import { RidaDrawing, ridaModels, type RidaModel } from "@/components/drawings/rida-drawings";
import { sheetMeasurements } from "@/lib/orders/tailor-sheet";
import { payloadClient } from "@/lib/payload";
import { AutoPrint } from "./auto-print";
import { printContext } from "../../../print-access";

type Params = { params: Promise<{ id: string }> };

const L = {
  title: t("Tailor sheet", "ورقة الخيّاط"),
  order: t("Order", "الطلب"),
  readyBy: t("Ready by", "جاهز بتاريخ"),
  notSet: t("Not set", "غير محدد"),
  customer: t("Customer", "العميلة"),
  phone: t("Phone", "الهاتف"),
  email: t("Email", "البريد"),
  piece: t("Piece", "القطعة"),
  of: t("of", "من"),
  quantity: t("Quantity", "الكمية"),
  measurement: t("Measurement", "القياس"),
  cm: t("Centimetres", "سنتيمتر"),
  inches: t("Inches", "إنش"),
  entered: t("Bold: as the customer entered it. ≈ converted.", "الخط العريض: كما أدخلتها العميلة. ≈ تحويل تقريبي."),
  customerNotes: t("Customer's notes", "ملاحظات العميلة"),
  workshopNotes: t("Workshop notes", "ملاحظات الورشة"),
  printed: t("Printed", "طُبعت في"),
  print: t("Print", "طباعة"),
};

async function loadOrder(id: string): Promise<Order | null> {
  const n = Number(id);
  if (!Number.isInteger(n) || n < 1) return null;
  const payload = await payloadClient();
  const order = await payload.findByID({ collection: "orders", id: n, depth: 1, disableErrors: true });
  return order && order.status !== "pending_payment" ? order : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { user, lang } = await printContext();
  if (!user) return {};
  const order = await loadOrder((await params).id);
  return { title: order ? `${order.number} · ${L.title[lang]}` : L.title[lang] };
}

/**
 * The tailor sheet: one order on A4 for the workshop, in the admin's language.
 * Each piece with its drawing, quantity and measurements in both units, the
 * customer's notes, and the team's notes. No address and no prices. Admins
 * only; anyone else gets "page not found".
 */
export default async function TailorSheet({ params }: Params) {
  const { user, lang } = await printContext();
  if (!user) notFound();
  const order = await loadOrder((await params).id);
  if (!order) notFound();

  const lines = order.lines ?? [];
  return (
    <main className="sheet">
      <AutoPrint label={L.print[lang]} />

      <header className="sheet-head">
        <div>
          <p className="sheet-brand">DAR RIDA</p>
          <h1 className="sheet-title">{L.title[lang]}</h1>
        </div>
        <dl className="sheet-key">
          <div>
            <dt>{L.order[lang]}</dt>
            <dd className="sheet-number">{order.number}</dd>
          </div>
          <div>
            <dt>{L.readyBy[lang]}</dt>
            <dd className="sheet-ready">{order.readyBy ? shortDate(order.readyBy, lang) : L.notSet[lang]}</dd>
          </div>
        </dl>
      </header>

      <section className="sheet-customer" aria-label={L.customer[lang]}>
        <div>
          <span>{L.customer[lang]}</span>
          <strong dir="auto">{order.customerName || "—"}</strong>
        </div>
        <div>
          <span>{L.phone[lang]}</span>
          <strong dir="ltr">{order.customerPhone || "—"}</strong>
        </div>
        <div>
          <span>{L.email[lang]}</span>
          <strong dir="ltr">{order.customerEmail || "—"}</strong>
        </div>
      </section>

      {lines.map((line, i) => {
        const design = typeof line.design === "object" && line.design ? (line.design as Design) : null;
        const model = design?.drawing && (ridaModels as readonly string[]).includes(design.drawing) ? (design.drawing as RidaModel) : null;
        const name = (lang === "ar" && line.nameAr) || line.name;
        const rows = sheetMeasurements(line.measurements, lang);
        const choices = (line.choices ?? []).filter((c) => c.label && c.value);
        return (
          <article key={line.id ?? i} className="sheet-piece">
            <div className="sheet-drawing">{model ? <RidaDrawing model={model} label={name} /> : null}</div>
            <div className="sheet-piece-body">
              <div className="sheet-piece-head">
                <div>
                  <p className="sheet-piece-count">
                    {L.piece[lang]} {i + 1} {L.of[lang]} {lines.length}
                  </p>
                  <h2 className="sheet-piece-name">{name}</h2>
                </div>
                <p className="sheet-qty">
                  <span>{L.quantity[lang]}</span>
                  <strong>× {line.quantity}</strong>
                </p>
              </div>

              {choices.length ? (
                <ul className="sheet-choices">
                  {choices.map((c, j) => (
                    <li key={j}>
                      {c.label}: <strong>{c.value}</strong>
                    </li>
                  ))}
                </ul>
              ) : null}

              <table className="sheet-measurements">
                <thead>
                  <tr>
                    <th scope="col">{L.measurement[lang]}</th>
                    <th scope="col">{L.cm[lang]}</th>
                    <th scope="col">{L.inches[lang]}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.key}>
                      <th scope="row">{r.label}</th>
                      <td className={r.exact === "cm" ? "exact" : undefined}>{r.cm}</td>
                      <td className={r.exact === "in" ? "exact" : undefined}>{r.in}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {line.notes ? (
                <div className="sheet-notes">
                  <span>{L.customerNotes[lang]}</span>
                  <p dir="auto">{line.notes}</p>
                </div>
              ) : null}
            </div>
          </article>
        );
      })}

      {order.teamNotes ? (
        <section className="sheet-workshop">
          <h2>{L.workshopNotes[lang]}</h2>
          <p dir="auto">{order.teamNotes}</p>
        </section>
      ) : null}

      <footer className="sheet-foot">
        <span>{L.entered[lang]}</span>
        <span>
          {L.printed[lang]} {shortDate(new Date(), lang)}
        </span>
      </footer>
    </main>
  );
}
