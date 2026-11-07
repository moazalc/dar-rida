import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, pageFrame } from "@/components/page-intro";
import { statusAction } from "@/components/status-page";
import { lengthByHeight, sizeChart, standardSizes } from "@/lib/configurator/options";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary(await getLocale())).sizeGuide;
  return { title: t.metaTitle, description: t.intro };
}

/** The measurements shown on the diagram, in its numbering. */
const steps = ["length", "bust", "shoulder", "sleeve", "hips"] as const;

const th = "py-3 pe-4 text-start text-xs font-normal tracking-[0.16em] text-muted-foreground uppercase";
const td = "py-3.5 pe-4 tabular-nums";

export default async function SizeGuidePage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.sizeGuide;
  const fields = dict.design.sizing.fields;
  const num = (n: number) => n.toLocaleString(locale);

  return (
    <div className={pageFrame}>
      <PageIntro eyebrow={t.eyebrow} title={t.title} intro={t.intro} />

      <div className="mt-16 grid gap-16 border-t border-border/60 pt-14 lg:grid-cols-2 lg:gap-24">
        <section>
          <h2 className="font-heading text-3xl md:text-4xl">{t.chartTitle}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t.chartNote}</p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[22rem] border-collapse">
              <thead className="border-b border-border/70">
                <tr>
                  <th className={th}>{t.columns.size}</th>
                  <th className={th}>{t.columns.bust}</th>
                  <th className={th}>{t.columns.hips}</th>
                  <th className={th}>{t.columns.shoulder}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {standardSizes.map((size) => (
                  <tr key={size}>
                    <td className={`${td} font-heading text-xl`}>{size}</td>
                    <td className={td} dir="ltr">{sizeChart[size].bust}</td>
                    <td className={td} dir="ltr">{sizeChart[size].hips}</td>
                    <td className={td} dir="ltr">{sizeChart[size].shoulder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-3xl md:text-4xl">{t.lengthTitle}</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">{t.lengthIntro}</p>
          <table className="mt-6 w-full border-collapse">
            <thead className="border-b border-border/70">
              <tr>
                <th className={th}>
                  {t.lengthColumns.height} ({dict.design.sizing.units.cm})
                </th>
                <th className={th}>
                  {t.lengthColumns.length} ({dict.design.sizing.units.in})
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {lengthByHeight.map((row) => (
                <tr key={row.height}>
                  <td className={td} dir="ltr">{row.height}</td>
                  <td className={td} dir="ltr">{row.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section className="mt-20 grid items-start gap-12 border-t border-border/60 pt-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-24">
        <MeasureDiagram label={t.diagramLabel} num={num} />
        <div>
          <h2 className="font-heading text-3xl md:text-4xl">{t.measureTitle}</h2>
          <p className="mt-3 max-w-lg text-muted-foreground">{t.measureIntro}</p>
          <ol className="mt-8 flex flex-col gap-6">
            {steps.map((m, i) => (
              <li key={m} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-4">
                <span className="flex size-8 items-center justify-center rounded-full bg-champagne/40 text-sm">
                  {num(i + 1)}
                </span>
                <div>
                  <p className="font-heading text-2xl">{fields[m].label}</p>
                  <p className="mt-1 text-muted-foreground">{fields[m].hint}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mt-20 flex flex-col items-start gap-6 bg-linen p-8 md:flex-row md:items-center md:justify-between md:p-12">
        <div className="max-w-xl">
          <h2 className="font-heading text-3xl md:text-4xl">{t.customTitle}</h2>
          <p className="mt-3 text-muted-foreground">{t.customBody}</p>
        </div>
        <Link href="/design" className={statusAction.primary}>
          {t.cta}
        </Link>
      </section>
    </div>
  );
}

/** A quiet line drawing of a figure with the five measurements numbered. */
function MeasureDiagram({ label, num }: { label: string; num: (n: number) => string }) {
  const marker = (n: number, x: number, y: number) => (
    <g key={n}>
      <circle cx={x} cy={y} r="9" className="fill-champagne" />
      <text x={x} y={y + 3.5} textAnchor="middle" className="fill-foreground text-[10px]">
        {num(n)}
      </text>
    </g>
  );
  return (
    <svg role="img" aria-label={label} viewBox="0 0 240 420" className="mx-auto w-full max-w-xs text-foreground/70">
      {/* Figure */}
      <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round">
        <circle cx="120" cy="38" r="20" />
        <path d="M112 57 V68 M128 57 V68" />
        <path d="M120 66 C104 66 96 72 84 82 L92 140 C96 165 98 180 98 190 C94 205 90 218 90 230 L72 400 H168 L150 230 C150 218 146 205 142 190 C142 180 144 165 148 140 L156 82 C144 72 136 66 120 66 Z" />
        <path d="M84 84 C74 100 68 150 64 228 M156 84 C166 100 172 150 176 228" />
      </g>
      {/* Measurements */}
      <g className="stroke-champagne" strokeWidth="1.2" fill="none">
        <path d="M40 82 V400 M34 82 H46 M34 400 H46" />
        <path d="M90 130 H150" strokeDasharray="3 3" />
        <path d="M84 72 H156 M84 67 V77 M156 67 V77" />
        <path d="M184 84 L194 228" />
        <path d="M89 232 H151" strokeDasharray="3 3" />
      </g>
      {marker(1, 40, 240)}
      {marker(2, 120, 130)}
      {marker(3, 120, 72)}
      {marker(4, 190, 156)}
      {marker(5, 120, 232)}
    </svg>
  );
}
