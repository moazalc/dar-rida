import { Placeholder } from "@/components/placeholder";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const images = ["/media/process-1.jpg", "/media/process-2.jpg", "/media/process-3.jpg", "/media/process-4.jpg"];

/**
 * The process as a strip of photographs on a linen ground, one per step. On
 * phones it becomes a swipeable row (with the next frame peeking in) instead
 * of four tall stacks.
 */
export function HowItWorks({ dict }: { dict: Dictionary }) {
  const t = dict.home.howItWorks;

  return (
    <section className="bg-linen py-24 md:py-36">
      <div className="mx-auto max-w-[90rem]">
        <div className="flex flex-wrap items-end justify-between gap-6 px-4 md:px-10 xl:px-18">
          <div>
            <p className="text-sm tracking-[0.3em] text-foreground/70 uppercase">{t.eyebrow}</p>
            <h2 className="mt-4 font-heading text-5xl leading-none font-light md:text-7xl">{t.title}</h2>
          </div>
          <p className="max-w-sm text-lg leading-relaxed text-foreground/75">{t.intro}</p>
        </div>

        <ol className="mt-14 grid snap-x snap-mandatory auto-cols-[78%] grid-flow-col gap-6 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] sm:auto-cols-[45%] md:scroll-px-10 md:px-10 lg:grid-flow-row lg:grid-cols-4 lg:overflow-visible xl:px-18">
          {t.steps.map((step, i) => (
            <li key={step.title} className="flex snap-start flex-col gap-5">
              <Placeholder
                label=""
                src={images[i]}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 78vw"
                className="aspect-[4/5] w-full"
              />
              <h3 className="font-heading text-3xl">
                <span aria-hidden className="text-foreground/60 italic">
                  {step.numeral}
                </span>{" "}
                {step.title}
              </h3>
              <p className="text-base leading-relaxed text-foreground/75">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
