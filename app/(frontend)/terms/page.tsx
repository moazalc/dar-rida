import type { Metadata } from "next";
import { InfoSections } from "@/components/info-sections";
import { PageIntro, pageFrame } from "@/components/page-intro";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary(await getLocale())).info.terms;
  return { title: t.metaTitle, description: t.intro };
}

export default async function TermsPage() {
  const t = (await getDictionary(await getLocale())).info.terms;

  return (
    <div className={pageFrame}>
      <PageIntro eyebrow={t.eyebrow} title={t.title} intro={t.intro} />
      <div className="mt-16">
        <InfoSections sections={t.sections} />
      </div>
    </div>
  );
}
