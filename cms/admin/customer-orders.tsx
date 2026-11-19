import type { Order } from "@/cms/payload-types";
import type { PayloadRequest, ServerProps } from "payload";
import { formatAdminURL } from "payload/shared";
import { formatOrderMoney } from "../fields";
import { adminLang, shortDate, STATUS_LABEL, t } from "./i18n";

type Props = Partial<ServerProps> & { data?: { id?: number; email?: string }; req?: PayloadRequest };

/**
 * Every order of a customer: those placed while signed in, and guest orders
 * with the same email, as her account page shows them. Unpaid checkouts are left out.
 */
export async function CustomerOrders({ data, i18n, payload, req }: Props) {
  if (!payload || !data?.id) return null;
  const lang = adminLang(i18n);
  const email = data.email?.toLowerCase();
  const { docs } = await payload.find({
    collection: "orders",
    where: {
      and: [
        { status: { not_equals: "pending_payment" } },
        { or: [{ customer: { equals: data.id } }, ...(email ? [{ customerEmail: { equals: email } }] : [])] },
      ],
    },
    sort: "-createdAt",
    limit: 50,
    depth: 0,
    select: { number: true, status: true, total: true, currency: true, createdAt: true },
    req,
  });
  const base = formatAdminURL({ adminRoute: payload.config.routes.admin, path: "/collections/orders" });

  return (
    <div className="dr-field">
      <p className="dr-field__label">{t("Orders", "الطلبات")[lang]}</p>
      {docs.length ? (
        <table className="dr-table">
          <tbody>
            {(docs as Order[]).map((o) => (
              <tr key={o.id}>
                <td>
                  <a href={`${base}/${o.id}`}>{o.number}</a>
                </td>
                <td>{STATUS_LABEL[o.status]?.[lang] ?? o.status}</td>
                <td>{formatOrderMoney(o.total, o.currency)}</td>
                <td className="dr-muted">{shortDate(o.createdAt, lang)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="dr-muted">{t("No orders yet.", "لا طلبات بعد.")[lang]}</p>
      )}
    </div>
  );
}
