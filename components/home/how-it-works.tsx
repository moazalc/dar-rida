import { Placeholder } from "@/components/placeholder";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const images = ["/media/process-1.jpg", "/media/process-2.jpg", "/media/process-3.jpg", "/media/process-4.jpg"];

/**
 * The process as a strip of photographs, one per step. On phones it becomes a
 * swipeable row (with the next frame peeking in) instead of four tall stacks.
 */
export function HowItWorks({ dict }: { dict: Dictionary }) {
  const t = dict.home.howItWorks;

  return (
    <section className="mx-auto max-w-7xl py-16 md:py-24">
      <div className="flex flex-col gap-4 px-4 md:px-10">
        <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">{t.eyebrow}</p>
        <h2 className="font-heading text-5xl md:text-6xl">{t.title}</h2>
      </div>

      <ol className="mt-12 grid snap-x snap-mandatory auto-cols-[78%] grid-flow-col gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] sm:auto-cols-[45%] md:scroll-px-10 md:px-10 lg:grid-flow-row lg:grid-cols-4 lg:gap-6 lg:overflow-visible">
        {t.steps.map((step, i) => (
          <li key={step.title} className="flex snap-start flex-col gap-5">
            <Placeholder
              label=""
              src={images[i]}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 78vw"
              className="aspect-[4/5] w-full"
            />
            <div className="flex items-baseline gap-4 border-t border-border pt-4">
              <span className="font-heading text-lg text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              <div className="flex flex-col gap-2">
                <h3 className="font-heading text-3xl">{step.title}</h3>
                <p className="text-base leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
