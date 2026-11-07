import Link from "next/link";
import { BuilderPreview } from "@/components/drawings/builder-preview";
import { LeafPattern } from "@/components/drawings/leaf-pattern";
import { statusAction } from "@/components/status-page";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * The call to the designer, on a light ground with a faint leaf pattern. The
 * pattern fades to a quarter strength behind the copy so the text stays easy
 * to read, and runs fuller behind the looping builder preview.
 */
export function Invitation({ dict }: { dict: Dictionary }) {
  const t = dict.home.invitation;

  return (
    <section className="relative overflow-hidden border-y border-champagne/35 bg-card">
      <LeafPattern
        id="invitation-leaves"
        className="pointer-events-none absolute inset-0 text-champagne opacity-[0.16] [mask-image:linear-gradient(to_right,rgb(0_0_0/0.25)_0%,rgb(0_0_0/0.25)_38%,#000_72%)] rtl:[mask-image:linear-gradient(to_left,rgb(0_0_0/0.25)_0%,rgb(0_0_0/0.25)_38%,#000_72%)]"
      />
      <div className="relative mx-auto grid max-w-[90rem] items-center gap-14 px-4 py-24 md:grid-cols-2 md:gap-20 md:px-10 md:py-36 xl:px-18">
        <div className="flex flex-col items-start">
          <p className="text-sm tracking-[0.3em] text-foreground/70 uppercase">{t.eyebrow}</p>
          <h2 className="mt-6 font-heading text-5xl leading-[1.04] font-light text-balance md:text-7xl">
            {t.title} <span className="italic">{t.titleEmphasis}</span>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-foreground/75">{t.body}</p>
          <Link href="/design" className={`mt-10 ${statusAction.primary}`}>
            {t.cta}
          </Link>
          <ul className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-xs tracking-[0.2em] text-foreground/70 uppercase">
            {t.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
        <BuilderPreview label={t.previewLabel} chips={t.chips} />
      </div>
    </section>
  );
}
