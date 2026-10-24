import Link from "next/link";
import { HeroVideo } from "@/components/home/hero-video";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** Full-bleed film with a quiet headline set low, and text links in place of buttons. */
export function Hero({ dict }: { dict: Dictionary }) {
  const t = dict.home.hero;

  return (
    <section data-hero className="relative h-svh min-h-[560px] w-full overflow-hidden bg-espresso">
      <HeroVideo
        src="/media/hero-montage.mp4"
        poster="/media/hero-poster.jpg"
        className="absolute inset-0 size-full object-cover opacity-75"
      />
      {/* Darken the top for the transparent header and the bottom for the copy. */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(20_17_15/0.55)_0%,transparent_28%,transparent_55%,rgb(20_17_15/0.75)_100%)]" />

      <div className="relative flex h-full flex-wrap items-end justify-between gap-10 px-4 pb-16 text-primary-foreground md:px-10 md:pb-20 xl:px-18">
        <div className="max-w-4xl">
          <p className="text-sm tracking-[0.3em] text-primary-foreground/80 uppercase">{t.eyebrow}</p>
          <h1 className="mt-5 font-heading text-6xl leading-[0.98] font-light whitespace-pre-line md:text-8xl xl:text-[7.25rem]">
            {t.title}
          </h1>
          <div className="mt-10 flex flex-wrap gap-x-9 gap-y-4 text-base tracking-[0.14em] uppercase">
            <Link href="/collection" className="border-b border-primary-foreground pb-1.5 transition-opacity hover:opacity-70">
              {t.shopCollection}
            </Link>
            <Link href="/design" className="border-b border-primary-foreground/45 pb-1.5 transition-opacity hover:opacity-70">
              {t.designYourOwn}
            </Link>
          </div>
        </div>

        {/* Names the film; it plays on its own, so this is a caption, not a control. */}
        <div className="hidden items-center gap-4 text-sm tracking-wide text-primary-foreground/85 md:flex">
          <span aria-hidden className="flex size-11 items-center justify-center rounded-full border border-primary-foreground/60">
            <svg width="12" height="12" viewBox="0 0 12 12" className="rtl:-scale-x-100">
              <path d="M3 1.5 L10 6 L3 10.5 Z" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </span>
          <span>
            {t.film}
            <br />
            <span className="text-primary-foreground/60">{t.filmMeta}</span>
          </span>
        </div>
      </div>
    </section>
  );
}
