import type { Metadata } from "next";
import Link from "next/link";
import { StatusPage, statusAction } from "@/components/status-page";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return { title: `${dict.errors.notFound.title} — ${dict.common.brandName}` };
}

export default async function NotFound() {
  const dict = await getDictionary(await getLocale());
  const t = dict.errors.notFound;

  return (
    <StatusPage code="404" title={t.title} body={t.body}>
      <Link href="/" className={statusAction.primary}>
        {t.home}
      </Link>
      <Link href="/collection" className={statusAction.secondary}>
        {t.collection}
      </Link>
    </StatusPage>
  );
}
