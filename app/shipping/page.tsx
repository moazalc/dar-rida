import type { Metadata } from "next";
import { InfoSections } from "@/components/info-sections";
import { PageIntro, pageFrame } from "@/components/page-intro";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary(await getLocale())).info.shipping;
  return { title: t.metaTitle, description: t.intro };
}

export default async function ShippingPage() {
  const t = (await getDictionary(await getLocale())).info.shipping;

  return (
    <div className={pageFrame}>
      <PageIntro eyebrow={t.eyebrow} title={t.title} intro={t.intro} />
      <div className="mt-16">
        <InfoSections sections={t.sections} />
      </div>

      <section className="mt-14 max-w-4xl">
        <h2 className="font-heading text-3xl">{t.tableTitle}</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[30rem] border-collapse">
            <thead className="border-b border-border/70">
              <tr>
                {[t.columns.region, t.columns.time, t.columns.cost].map((c) => (
                  <th key={c} className="py-3 pe-6 text-start text-xs font-normal tracking-[0.16em] text-muted-foreground uppercase">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {t.rows.map((row) => (
                <tr key={row.region}>
                  <td className="py-4 pe-6">{row.region}</td>
                  <td className="py-4 pe-6 text-muted-foreground">{row.time}</td>
                  <td className="py-4 pe-6 text-muted-foreground">{row.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
