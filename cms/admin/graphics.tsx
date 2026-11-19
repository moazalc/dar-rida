"use client";

import { useTranslation } from "@payloadcms/ui";
import { usePathname } from "next/navigation";
import { adminLang, t } from "./i18n";

/** Dar Rida's mark in the header breadcrumb, in place of Payload's icon. */
export function Icon() {
  return (
    <svg className="dr-icon" width="24" height="24" viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" fill="#2b2420" />
      <text x="32" y="43" textAnchor="middle" fontFamily="Georgia, serif" fontSize="30" fill="#f7f2e9" letterSpacing="2">
        DR
      </text>
    </svg>
  );
}

/** Above the form on the login, forgot-password and first-user pages. On the login page the brand panel shows the name, so this is the heading. */
export function Logo() {
  const pathname = usePathname() ?? "";
  const lang = adminLang(useTranslation().i18n);
  if (pathname.endsWith("/login")) {
    return (
      <div className="dr-login__head">
        <h1>{t("Log in", "تسجيل الدخول")[lang]}</h1>
        <p>{t("For the Dar Rida team only.", "لفريق دار رِدا فقط.")[lang]}</p>
      </div>
    );
  }
  return <span className="dr-wordmark dr-wordmark--large">DAR RIDA</span>;
}
