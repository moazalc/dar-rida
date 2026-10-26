import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, pageFrame } from "@/components/page-intro";
import { options } from "@/lib/configurator/options";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary(await getLocale())).fabrics;
  return { title: t.metaTitle, description: t.intro };
}

/**
 * Painted stand-ins for swatch photos, until the studio shoot: each suggests
 * its fabric's character — matte grain, soft sheen, liquid shine, sheer layers.
 */
const swatches: Record<(typeof options.fabric)[number], React.CSSProperties> = {
  crepe: {
    background:
      "repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, transparent 0 46px, rgba(0,0,0,0.25) 60px, transparent 74px), #1d1b1a",
  },
  nida: {
    background:
      "repeating-linear-gradient(90deg, transparent 0 40px, rgba(0,0,0,0.18) 55px, transparent 70px), linear-gradient(115deg, #46342b 0%, #6d5446 34%, #574135 52%, #7a6050 70%, #45332a 100%)",
  },
  silk: {
    background:
      "repeating-linear-gradient(90deg, transparent 0 52px, rgba(0,0,0,0.3) 66px, transparent 80px), linear-gradient(120deg, #121827 0%, #3c4864 26%, #1b2233 42%, #55617f 60%, #171d2c 78%, #2d3750 100%)",
  },
  chiffon: {
    background:
      "linear-gradient(96deg, rgba(179,167,148,0.5) 0%, rgba(179,167,148,0.35) 30%, transparent 48%), linear-gradient(84deg, transparent 22%, rgba(179,167,148,0.4) 42%, rgba(179,167,148,0.3) 68%, transparent 86%), repeating-linear-gradient(90deg, transparent 0 34px, rgba(120,104,84,0.12) 44px, transparent 54px), #e9e1d4",
  },
};

export default async function FabricsPage() {
  const dict = await getDictionary(await getLocale());
  const t = dict.fabrics;

  return (
    <div className={pageFrame}>
      <PageIntro eyebrow={t.eyebrow} title={t.title} intro={t.intro} />

      <ul className="mt-16 flex flex-col border-t border-border/60">
        {options.fabric.map((fabric, i) => {
          const item = t.items[fabric];
          const name = dict.design.options.fabric[fabric].name;
          return (
            <li
              key={fabric}
              className="grid items-center gap-8 border-b border-border/60 py-12 md:grid-cols-2 md:gap-16 md:py-16 lg:gap-24"
            >
              <div
                aria-hidden
                className={cn("aspect-[5/4] w-full", i % 2 === 1 && "md:order-2")}
                style={swatches[fabric]}
              />
              <div>
                <h2 className="font-heading text-5xl font-light md:text-6xl">{name}</h2>
                <p className="mt-4 max-w-md text-lg leading-relaxed text-muted-foreground">{item.body}</p>
                <dl className="mt-8 grid max-w-md grid-cols-[7rem_minmax(0,1fr)] gap-x-6 gap-y-3 text-sm">
                  {(["feel", "drape", "wear", "care"] as const).map((k) => (
                    <div key={k} className="contents">
                      <dt className="tracking-[0.14em] text-muted-foreground uppercase">{t.labels[k]}</dt>
                      <dd>{item[k]}</dd>
                    </div>
                  ))}
                </dl>
                <Link
                  href={`/design?fabric=${fabric}`}
                  className="mt-8 inline-block text-sm tracking-[0.16em] uppercase underline underline-offset-8 hover:opacity-70"
                >
                  {t.cta.replace("{fabric}", name)}
                </Link>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-10 max-w-xl text-sm text-muted-foreground">{t.note}</p>
    </div>
  );
}
