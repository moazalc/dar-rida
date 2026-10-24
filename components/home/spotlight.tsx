import Link from "next/link";
import { Placeholder } from "@/components/placeholder";
import { statusAction } from "@/components/status-page";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** One piece from the collection, given a whole section. */
export function Spotlight({ dict }: { dict: Dictionary }) {
  const t = dict.home.spotlight;

  return (
    <section className="mx-auto grid max-w-[90rem] items-center gap-12 px-4 py-24 md:grid-cols-2 md:gap-20 md:px-10 md:py-36 lg:gap-28 xl:px-18">
      <div className="relative">
        <Placeholder
          label={t.imageAlt}
          src="/media/rida-01.jpg"
          objectPosition="50% 30%"
          sizes="(min-width: 768px) 50vw, 100vw"
          className="aspect-[4/5] w-full"
        />
        <span className="absolute start-5 bottom-5 bg-background px-3.5 py-2 text-xs tracking-[0.24em] uppercase">
          {t.badge}
        </span>
      </div>
      <div className="flex flex-col items-start gap-6">
        <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">{t.eyebrow}</p>
        <h2 className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <span className="font-heading text-7xl leading-[0.9] font-light md:text-8xl xl:text-9xl">{t.name}</span>
          <span lang={t.nameAltLang} className="font-heading text-3xl text-muted-foreground">
            {t.nameAlt}
          </span>
        </h2>
        <p className="max-w-md text-lg leading-relaxed text-muted-foreground">{t.body}</p>
        <p className="font-heading text-3xl">{t.price}</p>
        <div className="flex flex-wrap gap-3.5">
          <Link href="/collection" className={statusAction.primary}>
            {t.view}
          </Link>
          <Link href="/design" className={statusAction.secondary}>
            {t.custom}
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">{t.note}</p>
      </div>
    </section>
  );
}
