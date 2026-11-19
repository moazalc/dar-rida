import { NavHamburger, NavWrapper } from "@payloadcms/next/client";
import { Logout } from "@payloadcms/ui";
import { getNavGroups } from "@payloadcms/ui/shared";
import type { PayloadRequest, ServerProps, VisibleEntities } from "payload";
import { formatAdminURL } from "payload/shared";
import { adminLang, t } from "./i18n";
import { NavFooter, NavLinks, type NavGroupData } from "./Nav.client";
import { entityTitle, sortGroups } from "./nav-order";

type Props = ServerProps & { req?: PayloadRequest; visibleEntities?: VisibleEntities };

/**
 * The Dar Rida menu (ported from datum): wordmark, Dashboard, then Shop and
 * Settings. Orders carry a count of new orders waiting to be started.
 */
export async function Nav({ i18n, payload, permissions, req, user, visibleEntities }: Props) {
  if (!payload?.config || !visibleEntities || !permissions) return null;
  const adminRoute = payload.config.routes.admin;
  const lang = adminLang(i18n);
  const sorted = sortGroups(getNavGroups(permissions, visibleEntities, payload.config, i18n));

  const newOrders = permissions.collections?.orders?.read
    ? (await payload.count({ collection: "orders", req, where: { status: { equals: "paid" } } })).totalDocs
    : 0;

  const groups: NavGroupData[] = sorted.map(({ label, entities }) => ({
    label,
    items: entities.map(({ slug, type, label: entityLabel }) => ({
      slug,
      label: entityTitle(entityLabel, slug, i18n.language),
      href: formatAdminURL({ adminRoute, path: `/${type}/${slug}` }),
      badge: slug === "orders" && newOrders > 0 ? t(`${newOrders} new`, `${newOrders} جديد`)[lang] : undefined,
    })),
  }));

  return (
    <NavWrapper baseClass="nav">
      <nav className="nav__wrap dr-nav" aria-label={t("Main", "القائمة الرئيسية")[lang]}>
        <a className="dr-nav__logo" href={adminRoute} aria-label={t("Dar Rida admin, dashboard", "إدارة دار رِدا، لوحة التحكم")[lang]}>
          <span className="dr-wordmark">DAR RIDA</span>
        </a>
        <NavLinks
          dashboardHref={adminRoute}
          groups={groups}
          text={{ overview: t("Overview", "نظرة عامة")[lang], dashboard: i18n.t("general:dashboard") }}
        />
        <NavFooter
          accountHref={formatAdminURL({ adminRoute, path: "/account" })}
          email={typeof user?.email === "string" ? user.email : ""}
          logout={<Logout />}
          role={t("Owner", "مالك")[lang]}
          text={{
            viewWebsite: t("View shop", "عرض المتجر")[lang],
            toDark: t("Switch to dark mode", "التبديل إلى الوضع الداكن")[lang],
            toLight: t("Switch to light mode", "التبديل إلى الوضع الفاتح")[lang],
          }}
        />
      </nav>
      <div className="nav__header">
        <div className="nav__header-content">
          <NavHamburger baseClass="nav" />
        </div>
      </div>
    </NavWrapper>
  );
}
