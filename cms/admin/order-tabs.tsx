import type { PayloadRequest, ServerProps } from "payload";
import { formatAdminURL } from "payload/shared";
import { adminLang, t } from "./i18n";
import { OrderTabLinks } from "./order-tabs.client";

const TABS = [
  { status: "paid", label: t("New", "جديد") },
  { status: "in_production", label: t("In production", "قيد التنفيذ") },
  { status: "shipped", label: t("Shipped", "تم الشحن") },
  { status: "completed", label: t("Delivered", "تم التسليم") },
  { status: "cancelled", label: t("Cancelled", "ملغى") },
] as const;

/** Above the orders table: one tab per step, with a count on the ones that need doing. */
export async function OrderTabs({ i18n, payload, req }: Partial<ServerProps> & { req?: PayloadRequest }) {
  if (!payload) return null;
  const lang = adminLang(i18n);
  const base = formatAdminURL({ adminRoute: payload.config.routes.admin, path: "/collections/orders" });
  const counts = await Promise.all(
    TABS.slice(0, 3).map((tab) => payload.count({ collection: "orders", where: { status: { equals: tab.status } }, req }).then((r) => r.totalDocs)),
  );
  return (
    <OrderTabLinks
      label={t("Orders by step", "الطلبات حسب المرحلة")[lang]}
      exportHref={`${payload.config.routes.api}/orders/export`}
      exportLabel={t("Export CSV", "تصدير CSV")[lang]}
      tabs={[
        ...TABS.map((tab, i) => ({
          status: tab.status as string | null,
          label: tab.label[lang],
          href: `${base}?where[status][equals]=${tab.status}`,
          count: counts[i] ?? null,
        })),
        { status: null, label: t("All", "الكل")[lang], href: base, count: null },
      ]}
    />
  );
}
