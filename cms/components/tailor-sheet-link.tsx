"use client";

import { useDocumentInfo, useFormFields, useTranslation } from "@payloadcms/ui";
import { adminLang, t } from "@/cms/admin/i18n";

/**
 * "Print tailor sheet" in the order's top bar, beside Save. Opens the
 * printable sheet (app/(print)) in a new tab. Not shown on unpaid checkouts.
 */
export function TailorSheetLink() {
  const { id } = useDocumentInfo();
  const lang = adminLang(useTranslation().i18n);
  const status = useFormFields(([fields]) => fields.status?.value as string | undefined);
  if (!id || !status || status === "pending_payment") return null;
  return (
    <a className="btn btn--style-primary btn--size-medium dr-print-sheet" href={`/print/orders/${id}`} target="_blank" rel="noopener">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2" />
        <path d="M6 14h12v7H6z" />
      </svg>
      {t("Print tailor sheet", "طباعة ورقة الخيّاط")[lang]}
    </a>
  );
}
