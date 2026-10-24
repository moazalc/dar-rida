"use client";

import { useEffect } from "react";
import "./globals.css";
import { StatusPage, statusAction } from "@/components/status-page";
import en from "@/lib/i18n/dictionaries/en";
import ar from "@/lib/i18n/dictionaries/ar";

// Last-resort boundary: replaces the root layout when it fails, so there are
// no providers, no locale and no fonts here — only system faces. The locale
// can't be trusted either (resolving it may be what broke), so the message is
// shown in both languages.
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" dir="ltr">
      <body className="flex min-h-svh flex-col items-center justify-center">
        <title>{`${en.errors.generic.title} — ${en.common.brandName}`}</title>
        <StatusPage code="!" title={en.errors.generic.title} body={en.errors.generic.body} className="min-h-0 py-12">
          <button type="button" onClick={() => retry()} className={statusAction.primary}>
            {en.errors.generic.retry} · <span lang="ar">{ar.errors.generic.retry}</span>
          </button>
        </StatusPage>
        <div lang="ar" dir="rtl" className="max-w-lg px-4 pb-16 text-center">
          <p className="font-heading text-3xl">{ar.errors.generic.title}</p>
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{ar.errors.generic.body}</p>
        </div>
      </body>
    </html>
  );
}
