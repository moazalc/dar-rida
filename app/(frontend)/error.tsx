"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useDict } from "@/components/providers/i18n-provider";
import { StatusPage, statusAction } from "@/components/status-page";

// Catches errors in any page below the root layout; the header and footer
// stay, so the visitor can still navigate away.
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  const t = useDict().errors.generic;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage code="!" title={t.title} body={t.body}>
      <button type="button" onClick={() => retry()} className={statusAction.primary}>
        {t.retry}
      </button>
      <Link href="/" className={statusAction.secondary}>
        {t.home}
      </Link>
    </StatusPage>
  );
}
