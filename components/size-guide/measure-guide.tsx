"use client";

import { useState } from "react";
import { AccordionItem } from "@/components/accordion";
import { MeasureFigures } from "@/components/measure/figure";
import { UnitSwitch } from "@/components/measure/unit-switch";
import { useI18n } from "@/components/providers/i18n-provider";
import { useUnit } from "@/components/providers/unit-provider";
import { convertToGrid, formatMeasurement, measurementGrid, measurementKeys, type Measurement } from "@/lib/measurements";

/** A typical value for each measurement (cm), shown on the figure as an example. */
const EXAMPLES_CM: Record<Measurement, number> = { height: 162, length: 142, shoulder: 39, bust: 91, sleeve: 58, hips: 99 };

/** The unit switch for the size guide's title row. */
export function GuideUnitSwitch() {
  const t = useI18n().dict.sizeGuide;
  const { unit, setUnit } = useUnit();
  return (
    <div className="flex flex-col items-start gap-2">
      <span className="text-sm text-muted-foreground">{t.showIn}</span>
      <UnitSwitch value={unit} onChange={setUnit} long />
    </div>
  );
}

/**
 * The figure beside the six measurements, numbered in the order they are
 * taken. Opening one lights it up on the figure, with an example value in the
 * visitor's unit, and shows three short tips.
 */
export function MeasureGuide() {
  const { dict, locale } = useI18n();
  const t = dict.measure;
  const { unit } = useUnit();
  const [active, setActive] = useState<Measurement | null>("height");
  const fmt = (m: Measurement, v: number) => formatMeasurement(m, v, unit, locale, t.units);
  const example = active ? fmt(active, convertToGrid(active, EXAMPLES_CM[active], "cm", unit)) : null;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-10 md:grid-cols-2 md:gap-[clamp(2rem,5vw,4.5rem)]">
      <div className="bg-muted px-3 pt-7 pb-5 md:sticky md:top-28">
        <MeasureFigures
          active={active}
          labels={active && example ? { [active]: dict.sizeGuide.example.replace("{value}", example) } : {}}
          views={t.views}
          label={t.figureLabel}
          figureClassName="h-[min(560px,92vw)] w-auto max-w-[46%] md:h-[min(560px,42vw)]"
        />
      </div>

      <div>
        {measurementKeys.map((m, i) => {
          const values = measurementGrid[unit][m];
          return (
            <AccordionItem
              key={m}
              open={active === m}
              onToggle={() => setActive(active === m ? null : m)}
              buttonClassName="py-5 text-base tracking-normal normal-case"
              title={
                <span className="grid flex-1 grid-cols-[2.25rem_minmax(0,1fr)_auto] items-baseline gap-3">
                  <span className="font-heading text-lg text-muted-foreground italic">{(i + 1).toLocaleString(locale)}</span>
                  <span className={`font-heading text-[clamp(1.6rem,3vw,2rem)] leading-tight transition-colors ${active === m ? "text-gold" : ""}`}>
                    {t.fields[m].label}
                  </span>
                  <bdi className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                    {fmt(m, values[0])} – {fmt(m, values[values.length - 1])}
                  </bdi>
                </span>
              }
            >
              <ul className="flex flex-col gap-2 ps-12">
                {t.fields[m].tips.map((tip) => (
                  <li key={tip} className="relative ps-4 text-muted-foreground before:absolute before:start-0 before:top-[0.8em] before:h-px before:w-2 before:bg-gold">
                    {tip}
                  </li>
                ))}
              </ul>
            </AccordionItem>
          );
        })}
      </div>
    </div>
  );
}
