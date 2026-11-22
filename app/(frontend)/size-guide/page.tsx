import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { GuideUnitSwitch, MeasureGuide } from "@/components/size-guide/measure-guide";
import { statusAction } from "@/components/status-page";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary(await getLocale())).sizeGuide;
  return { title: t.metaTitle, description: t.intro };
}

const frame = "mx-auto max-w-[90rem] px-4 md:px-10 xl:px-18";

/** Line icons for "what you need": a tape measure, two people, a fitted top. */
const needIcons = [
  <svg key="tape" viewBox="0 0 34 34" aria-hidden className="size-9 shrink-0 fill-none stroke-gold" strokeWidth="1.2">
    <circle cx="15" cy="17" r="11" />
    <circle cx="15" cy="17" r="4" />
    <path d="M15 28 H32 M20 28 V25 M24 28 V26 M28 28 V25" />
  </svg>,
  <svg key="help" viewBox="0 0 34 34" aria-hidden className="size-9 shrink-0 fill-none stroke-gold" strokeWidth="1.2">
    <circle cx="11" cy="9" r="4" />
    <circle cx="23" cy="9" r="4" />
    <path d="M4 30 C4 20 18 20 18 30 M16 30 C16 20 30 20 30 30" />
  </svg>,
  <svg key="clothes" viewBox="0 0 34 34" aria-hidden className="size-9 shrink-0 fill-none stroke-gold" strokeWidth="1.2" strokeLinejoin="round">
    <path d="M12 4 L17 9 L22 4 L29 8 L26 15 L23 14 V30 H11 V14 L8 15 L5 8 Z" />
  </svg>,
];

export default async function SizeGuidePage() {
  const t = (await getDictionary(await getLocale())).sizeGuide;

  return (
    <div className="pb-20 md:pb-28">
      <div className={`${frame} flex flex-col gap-8 pt-12 pb-8 md:flex-row md:items-end md:justify-between md:pt-16`}>
        <PageIntro eyebrow={t.eyebrow} title={t.title} intro={t.intro} />
        <GuideUnitSwitch />
      </div>

      <div className={frame}>
        <ul className="grid border-y border-border/60 md:grid-cols-3">
          {t.need.map((n, i) => (
            <li
              key={n.title}
              className="flex items-center gap-4 py-4 not-first:border-t not-first:border-border/60 md:py-5 md:not-first:border-t-0 md:not-first:border-s md:not-first:ps-6"
            >
              {needIcons[i]}
              <p className="flex flex-col">
                <span className="font-medium">{n.title}</span>
                <span className="text-sm text-muted-foreground">{n.body}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>

      <section aria-label={t.title} className={`${frame} py-10 md:py-14`}>
        <MeasureGuide />
      </section>

      <section className={`${frame} flex flex-col items-start gap-6 pt-12 md:flex-row md:items-center md:justify-between md:pt-16`}>
        <div>
          <h2 className="font-heading text-3xl md:text-4xl">{t.helpTitle}</h2>
          <p className="mt-2 max-w-xl text-muted-foreground">{t.helpBody}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/contact" className={statusAction.secondary}>
            {t.helpCta}
          </Link>
          <Link href="/collection" className={statusAction.primary}>
            {t.cta}
          </Link>
        </div>
      </section>
    </div>
  );
}
