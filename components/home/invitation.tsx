import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** The closing call to the designer, over a full-bleed fabric photograph. */
export function Invitation({ dict }: { dict: Dictionary }) {
  const t = dict.home.invitation;

  return (
    <section className="relative flex min-h-[40rem] items-center justify-center overflow-hidden bg-espresso text-center text-primary-foreground">
      <Image src="/media/lace.jpg" alt="" fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-espresso/80" />
      <div className="relative max-w-3xl px-4 py-24">
        <p className="text-sm tracking-[0.3em] text-champagne uppercase">{t.eyebrow}</p>
        <h2 className="mt-6 font-heading text-5xl leading-[1.04] font-light md:text-7xl xl:text-[5.25rem]">
          {t.title}
          <br />
          <span className="italic">{t.titleEmphasis}</span>
        </h2>
        <Link
          href="/design"
          className="mt-11 inline-flex h-14 items-center bg-primary-foreground px-10 text-sm tracking-[0.16em] text-primary uppercase transition-opacity hover:opacity-90"
        >
          {t.cta}
        </Link>
      </div>
    </section>
  );
}
