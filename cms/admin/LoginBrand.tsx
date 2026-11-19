import type { ServerProps } from "payload";
import { adminLang, t } from "./i18n";

/** The dark Dar Rida panel beside the login form (left half on wide screens, right in Arabic; a band above the form on phones). */
export function LoginBrand({ i18n }: Partial<ServerProps>) {
  const lang = adminLang(i18n);
  return (
    <aside className="dr-login__brand">
      <span className="dr-wordmark dr-wordmark--large">DAR RIDA</span>
      <div className="dr-login__intro">
        <p className="dr-login__title">{t("Shop admin", "إدارة المتجر")[lang]}</p>
        <p className="dr-login__text">
          {t("Orders, customers and the collection, in English and Arabic.", "الطلبات والعملاء والتشكيلة، بالعربية والإنجليزية.")[lang]}
        </p>
      </div>
    </aside>
  );
}
