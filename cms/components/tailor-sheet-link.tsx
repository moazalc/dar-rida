"use client";

import { useDocumentInfo, useFormFields, useTranslation } from "@payloadcms/ui";
import { adminLang, t } from "@/cms/admin/i18n";

/** Opens the order's printable tailor sheet in a new tab (app/(print)). */
export function TailorSheetLink() {
  const { id } = useDocumentInfo();
  const lang = adminLang(useTranslation().i18n);
  const status = useFormFields(([fields]) => fields.status?.value as string | undefined);
  if (!id || !status || status === "pending_payment") return null;
  return (
    <p style={{ margin: "0 0 24px" }}>
      <a className="btn btn--style-secondary btn--size-medium" href={`/print/orders/${id}`} target="_blank" rel="noopener" style={{ margin: 0 }}>
        {t("Print tailor sheet", "طباعة ورقة الخيّاط")[lang]}
      </a>
    </p>
  );
}
