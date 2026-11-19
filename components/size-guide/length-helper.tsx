"use client";

import { useState } from "react";
import { Tape } from "@/components/measure/tape";
import { useI18n } from "@/components/providers/i18n-provider";
import { useUnit } from "@/components/providers/unit-provider";
import { convertToGrid, formatMeasurement, measurementGrid, suggestedLength } from "@/lib/measurements";

/** Pick a height on the tape; see the usual abaya length for it, in the same unit. */
export function LengthHelper() {
  const { dict, locale } = useI18n();
  const t = dict.sizeGuide;
  const units = dict.measure.units;
  const { unit } = useUnit();
  // Kept with its unit, so switching units moves it to the nearest height instead of misreading it.
  const [height, setHeight] = useState<{ value: number; unit: typeof unit } | null>(null);
  const value = height && (height.unit === unit ? height.value : convertToGrid("height", height.value, height.unit, unit));

  let result = "—";
  if (value !== null) {
    const [a, b] = suggestedLength(value, unit);
    const f = (v: number) => formatMeasurement("length", v, unit, locale, units);
    result = a === b ? f(a) : `${f(a)} – ${f(b)}`;
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground">{t.yourHeight}</p>
      <Tape
        className="mt-2 bg-background"
        values={measurementGrid[unit].height}
        value={value ?? undefined}
        format={(v) => formatMeasurement("height", v, unit, locale, units)}
        onChange={(v) => setHeight({ value: v, unit })}
        label={t.yourHeight}
      />
      <p className="mt-5 flex flex-wrap items-baseline gap-4" aria-live="polite">
        <span className="text-sm text-muted-foreground">{t.suggested}</span>
        <bdi className="font-heading text-5xl leading-none tabular-nums md:text-6xl">{result}</bdi>
      </p>
    </div>
  );
}
