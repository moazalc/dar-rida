import type { Metadata } from "next";
import Link from "next/link";
import "./(frontend)/globals.css";
import { StatusPage, statusAction } from "@/components/status-page";
import { fontVars } from "@/lib/fonts";
import { getDirection } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return { title: `${dict.errors.notFound.title} — ${dict.common.brandName}` };
}

/**
 * The 404 for any address no route matches. The shop and the admin each have
 * their own root layout, so this page brings its own document, fonts and styles.
 */
export default async function GlobalNotFound() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.errors.notFound;

  return (
    <html lang={locale} dir={getDirection(locale)} style={fontVars} className="h-full antialiased">
      <body className="flex min-h-full flex-col items-center justify-center">
        <StatusPage code="404" title={t.title} body={t.body}>
          <Link href="/" className={statusAction.primary}>
            {t.home}
          </Link>
          <Link href="/collection" className={statusAction.secondary}>
            {t.collection}
          </Link>
        </StatusPage>
      </body>
    </html>
  );
}
