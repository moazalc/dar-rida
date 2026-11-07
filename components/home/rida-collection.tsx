import Link from "next/link";
import { RidaCarousel } from "@/components/home/rida-carousel";
import { section } from "@/components/home/section";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** The Rida collection: one design at a time, in a carousel of all four. */
export function RidaCollection({ dict }: { dict: Dictionary }) {
  const t = dict.home.collectionRow;

  return (
    <section className={section.padding}>
      <div className={`${section.container} flex flex-wrap items-end justify-between gap-6`}>
        <div>
          <p className={section.eyebrow}>{t.eyebrow}</p>
          <h2 className={`mt-4 ${section.title}`}>{t.title}</h2>
        </div>
        <Link
          href="/collection"
          className="border-b border-foreground pb-1 text-sm tracking-[0.16em] uppercase transition-opacity hover:opacity-60"
        >
          {t.cta}
        </Link>
      </div>
      <div className={`${section.container} mt-12 md:mt-16`}>
        <RidaCarousel t={t} />
      </div>
    </section>
  );
}
