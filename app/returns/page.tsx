import type { Metadata } from "next";
import Link from "next/link";
import { InfoSections } from "@/components/info-sections";
import { PageIntro, pageFrame } from "@/components/page-intro";
import { statusAction } from "@/components/status-page";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary(await getLocale())).info.returns;
  return { title: t.metaTitle, description: t.intro };
}

export default async function ReturnsPage() {
  const dict = await getDictionary(await getLocale());
  const t = dict.info.returns;

  return (
    <div className={pageFrame}>
      <PageIntro eyebrow={t.eyebrow} title={t.title} intro={t.intro} />
      <div className="mt-16">
        <InfoSections sections={t.sections} />
      </div>
      <Link href="/contact" className={`${statusAction.primary} mt-12`}>
        {dict.info.faq.contact}
      </Link>
    </div>
  );
}
