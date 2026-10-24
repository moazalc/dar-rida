import { BadgeCheck, Globe, PenLine, Ruler } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const icons = [PenLine, Ruler, BadgeCheck, Globe];

export function HowItWorks({ dict }: { dict: Dictionary }) {
  const t = dict.home.howItWorks;

  return (
    <section className="border-t border-border/60 bg-card">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-10 md:py-24">
        <h2 className="text-center font-heading text-5xl md:text-6xl">{t.title}</h2>
        <ol className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {t.steps.map((step, i) => {
            const Icon = icons[i];
            return (
              <li key={step.title} className="flex flex-col items-center gap-4 text-center">
                <Icon className="size-8 text-muted-foreground" strokeWidth={1.25} aria-hidden />
                <span className="font-heading text-base text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-heading text-3xl">{step.title}</h3>
                <p className="max-w-64 text-base leading-relaxed text-muted-foreground md:text-lg">{step.body}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
