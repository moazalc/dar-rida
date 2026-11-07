"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LeafPattern } from "@/components/drawings/leaf-pattern";
import { RidaDrawing, ridaModels } from "@/components/drawings/rida-drawings";
import { section } from "@/components/home/section";
import { statusAction } from "@/components/status-page";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Copy = Dictionary["home"]["collectionRow"];

/**
 * The four Rida designs as slides on a scroll-snap track, so swiping is native
 * on phones. The arrows and dots scroll the track to a slide's offset from the
 * first one, which comes out right in RTL too, and an IntersectionObserver keeps the active dot in step with any swipe. No
 * autoplay: the customer moves it.
 */
export function RidaCarousel({ t }: { t: Copy }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const total = ridaModels.length;

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { root: el, threshold: 0.6 },
    );
    for (const slide of Array.from(el.children)) observer.observe(slide);
    return () => observer.disconnect();
  }, []);

  function go(index: number) {
    const el = track.current;
    if (!el) return;
    const slides = el.children as HTMLCollectionOf<HTMLElement>;
    const i = (index + total) % total;
    // Offsets measured from the first slide: positive in LTR, negative in RTL,
    // matching how browsers report `scrollLeft` in each direction.
    const left = slides[i].offsetLeft - slides[0].offsetLeft;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <div role="region" aria-roledescription="carousel" aria-label={t.title}>
      <div
        ref={track}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {ridaModels.map((model, i) => {
          const m = t.models[i];
          return (
            <article
              key={model}
              data-index={i}
              aria-roledescription="slide"
              aria-label={t.slide.replace("{n}", String(i + 1)).replace("{total}", String(total))}
              className="grid w-full shrink-0 snap-start items-center gap-10 md:grid-cols-2 md:gap-16 lg:gap-24"
            >
              <div className={`relative flex aspect-[4/5] items-center justify-center overflow-hidden ${section.tile}`}>
                <LeafPattern
                  id={`rida-leaves-${i}`}
                  className="pointer-events-none absolute inset-0 text-champagne opacity-[0.09]"
                />
                <RidaDrawing model={model} label={m.alt} className="relative mt-[4%] h-[88%] w-auto" />
                <span className="absolute start-4 top-4 bg-background px-3 py-1.5 text-[0.68rem] tracking-[0.2em] uppercase">
                  {t.badge}
                </span>
                {/* Phones: the controls fall below the copy, so each slide also
                    shows where it sits, right under the drawing. */}
                <span aria-hidden className="absolute inset-x-0 bottom-4 flex justify-center gap-2.5 md:hidden">
                  {ridaModels.map((dot, d) => (
                    <span
                      key={dot}
                      className={`size-1.5 rounded-full border border-foreground ${d === i ? "bg-foreground" : ""}`}
                    />
                  ))}
                </span>
              </div>

              <div className="flex flex-col items-start">
                <p aria-hidden className="font-heading text-xl text-foreground/60 italic">
                  <span dir="ltr">
                    {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                  </span>
                </p>
                <h3 dir="ltr" className="mt-4 font-heading text-7xl leading-[0.9] font-light whitespace-nowrap md:text-8xl">
                  {m.code}
                </h3>
                <p className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 font-heading text-3xl">
                  <span>{m.name}</span>
                  <span lang={m.nameAltLang} className="text-2xl text-foreground/60">
                    {m.nameAlt}
                  </span>
                </p>
                <p className={`mt-6 max-w-md ${section.body}`}>{m.body}</p>
                <p className="mt-6 border-t border-champagne pt-3 text-xs tracking-[0.18em] text-foreground/70 uppercase">
                  {m.cut}
                </p>
                <div className="mt-8 flex flex-wrap gap-3.5">
                  <Link href="/collection" className={statusAction.primary}>
                    {t.view}
                  </Link>
                  <Link href="/design" className={statusAction.secondary}>
                    {t.custom}
                  </Link>
                </div>
                <p className="mt-5 text-sm text-foreground/65">{t.note}</p>
              </div>
            </article>
          );
        })}
      </div>

      {/* Controls sit under the drawing column. */}
      <div className="mt-8 grid md:grid-cols-2 md:gap-16 lg:gap-24">
        <div className="flex items-center justify-center gap-6">
          <ArrowButton label={t.previous} onClick={() => go(active - 1)} direction="back" />
          <div className="flex items-center gap-1">
            {ridaModels.map((model, i) => (
              <button
                key={model}
                type="button"
                onClick={() => go(i)}
                aria-label={t.goTo.replace("{code}", t.models[i].code)}
                aria-current={i === active ? "true" : undefined}
                className="group flex size-7 items-center justify-center rounded-full outline-none focus-visible:ring-1 focus-visible:ring-foreground"
              >
                <span
                  className={`block size-2 rounded-full border border-foreground transition-colors duration-300 ${
                    i === active ? "bg-foreground" : "bg-transparent group-hover:bg-foreground/30"
                  }`}
                />
              </button>
            ))}
          </div>
          <ArrowButton label={t.next} onClick={() => go(active + 1)} direction="forward" />
        </div>
      </div>
    </div>
  );
}

function ArrowButton({ label, onClick, direction }: { label: string; onClick: () => void; direction: "back" | "forward" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-11 items-center justify-center rounded-full border border-champagne transition-colors hover:border-foreground focus-visible:border-foreground focus-visible:outline-none"
    >
      <svg
        width="16"
        height="10"
        viewBox="0 0 16 10"
        aria-hidden
        className={direction === "back" ? "-scale-x-100 rtl:scale-x-100" : "rtl:-scale-x-100"}
      >
        <path d="M0 5h15M11 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
    </button>
  );
}
