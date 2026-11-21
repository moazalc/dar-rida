import type { Metadata } from "next";
import type { ReactNode } from "react";
import { InfoSections } from "@/components/info-sections";
import { PageIntro, pageFrame } from "@/components/page-intro";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { formatMoney, toMinor, type Currency } from "@/lib/markets";
import { payloadClient } from "@/lib/payload";

/** The fees and times come from the admin's Shipping settings, so they always match the bag. */
export const dynamic = "force-dynamic";

type Rule = { fee?: number | null; freeOver?: number | null; deliveryDays?: number | null } | null | undefined;
type Settings = { uae?: Rule; zones?: ({ name: string } & NonNullable<Rule>)[] | null; restOfWorld?: Rule };

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary(await getLocale())).info.shipping;
  return { title: t.metaTitle, description: t.intro };
}

export default async function ShippingPage() {
  const t = (await getDictionary(await getLocale())).info.shipping;
  const payload = await payloadClient();
  const settings = (await payload.findGlobal({ slug: "shipping", depth: 0 })) as Settings;

  const money = (amount: number, currency: Currency) => <bdi>{formatMoney(Math.round(amount * 100), currency)}</bdi>;
  function cost(rule: Rule, currency: Currency): ReactNode {
    const fee = toMinor(rule?.fee);
    if (fee === null) return t.free;
    if (!toMinor(rule?.freeOver)) return money(rule!.fee!, currency);
    const [before, middle, after] = t.freeOver.split(/\{fee\}|\{amount\}/);
    return (
      <>
        {before}
        {money(rule!.fee!, currency)}
        {middle}
        {money(rule!.freeOver!, currency)}
        {after}
      </>
    );
  }
  const time = (rule: Rule) => (rule?.deliveryDays ? t.days.replace("{n}", String(rule.deliveryDays)) : "—");
  const rows = [
    { region: t.uae, rule: settings.uae, currency: "aed" as const },
    ...(settings.zones ?? []).map((z) => ({ region: z.name, rule: z, currency: "usd" as const })),
    { region: t.restOfWorld, rule: settings.restOfWorld, currency: "usd" as const },
  ];

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
              {rows.map((row, i) => (
                <tr key={i}>
                  <td className="py-4 pe-6">{row.region}</td>
                  <td className="py-4 pe-6 text-muted-foreground">{time(row.rule)}</td>
                  <td className="py-4 pe-6 text-muted-foreground">{cost(row.rule, row.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
