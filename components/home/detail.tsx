import { Placeholder } from "@/components/placeholder";
import { section } from "@/components/home/section";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** Linen band: the handwork story and a short spec list beside a close-up. */
export function Detail({ dict }: { dict: Dictionary }) {
  const t = dict.home.detail;

  return (
    <section className="grid bg-linen text-foreground md:grid-cols-2">
      <div className="flex flex-col justify-center gap-7 px-4 py-20 md:px-12 md:py-28 xl:px-28">
        <p className={section.eyebrow}>{t.eyebrow}</p>
        <h2 className={`${section.title} whitespace-pre-line`}>
          {t.title}
        </h2>
        <p className={`max-w-md ${section.body}`}>{t.body}</p>
        <dl className="mt-3 max-w-md border-b border-foreground/20 text-base">
          {t.specs.map((spec) => (
            <div key={spec.label} className="flex justify-between gap-6 border-t border-foreground/20 py-4">
              <dt>{spec.label}</dt>
              <dd className="text-end text-foreground/70">{spec.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <Placeholder
        label={t.imageAlt}
        src="/media/craft.jpg"
        objectPosition="50% 50%"
        sizes="(min-width: 768px) 50vw, 100vw"
        className="aspect-[4/5] w-full md:aspect-auto md:min-h-[45rem]"
      />
    </section>
  );
}
