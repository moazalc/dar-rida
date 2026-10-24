import Link from "next/link";
import { Placeholder } from "@/components/placeholder";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** Close-up detail image beside the made-to-order / handwork story. */
export function Craft({ dict }: { dict: Dictionary }) {
  const t = dict.home.craft;

  return (
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 md:grid-cols-2 md:gap-20 md:px-10 md:pb-24">
      <Placeholder
        label={t.title}
        src="/media/sewing-closeup.jpg"
        objectPosition="45% 50%"
        sizes="(min-width: 768px) 50vw, 100vw"
        className="aspect-[4/5] w-full"
      />
      <div className="flex flex-col items-start gap-6">
        <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">{t.eyebrow}</p>
        <h2 className="font-heading text-5xl leading-tight md:text-6xl">{t.title}</h2>
        <p className="max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl">{t.body}</p>
        <Link
          href="/our-story"
          className="border-b border-foreground pb-1 text-base tracking-wide md:text-lg transition-opacity hover:opacity-70"
        >
          {t.cta}
        </Link>
      </div>
    </section>
  );
}
