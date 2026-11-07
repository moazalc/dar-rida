import { processIcons } from "@/components/home/process-icons";
import { section } from "@/components/home/section";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * The process on the ivory ground, one line icon per step on a pale tile. On
 * phones it becomes a swipeable row (with the next tile peeking in) instead
 * of four stacks.
 */
export function HowItWorks({ dict }: { dict: Dictionary }) {
  const t = dict.home.howItWorks;

  return (
    <section className={section.padding}>
      <div className="mx-auto max-w-[90rem]">
        <div className={`${section.container} flex flex-wrap items-end justify-between gap-6`}>
          <div>
            <p className={section.eyebrow}>{t.eyebrow}</p>
            <h2 className={`mt-4 ${section.title}`}>{t.title}</h2>
          </div>
          <p className={`max-w-sm ${section.body}`}>{t.intro}</p>
        </div>

        <ol className="mt-14 grid snap-x snap-mandatory auto-cols-[78%] grid-flow-col gap-6 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] sm:auto-cols-[45%] md:scroll-px-10 md:px-10 lg:grid-flow-row lg:grid-cols-4 lg:overflow-visible xl:px-18">
          {t.steps.map((step, i) => {
            const Icon = processIcons[i];
            return (
            <li key={step.title} className="flex snap-start flex-col gap-5">
              <div className={`flex aspect-[4/3] w-full items-center justify-center ${section.tile}`}>
                <Icon className="w-[42%] text-foreground" />
              </div>
              <h3 className="font-heading text-3xl">
                <span aria-hidden className="text-foreground/60 italic">
                  {step.numeral}
                </span>{" "}
                {step.title}
              </h3>
              <p className="text-base leading-relaxed text-foreground/75">{step.body}</p>
            </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
