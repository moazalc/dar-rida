"use client";

import Link from "next/link";
import { useId } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { measurementKeys, measurementSpec, type MeasurementsInput } from "@/lib/measurements";

const selectClass = "h-12 w-full border border-border/70 bg-background px-3 text-base";

/**
 * The six measurement dropdowns every piece is made to, with a hint under
 * each. Used by the collection pages and the builder, so both ask the same way.
 */
export function MeasurementsFields({
  value,
  onChange,
  className = "grid gap-x-4 gap-y-6 sm:grid-cols-2",
}: {
  value: MeasurementsInput;
  onChange: (value: MeasurementsInput) => void;
  className?: string;
}) {
  const { dict, locale } = useI18n();
  const t = dict.design.sizing;
  const id = useId();

  return (
    <div className="flex flex-col gap-6">
      <div className={className}>
        {measurementKeys.map((m) => (
          <div key={m} className="flex flex-col gap-2">
            <label htmlFor={`${id}-${m}`} className="text-sm">
              {t.fields[m].label}
            </label>
            <select
              id={`${id}-${m}`}
              name={m}
              required
              value={value[m]}
              onChange={(e) => onChange({ ...value, [m]: e.target.value })}
              className={selectClass}
            >
              <option value="" disabled>
                {t.choose}
              </option>
              {measurementSpec[m].values.map((v) => (
                <option key={v} value={String(v)}>
                  {v.toLocaleString(locale)} {t.units[measurementSpec[m].unit]}
                </option>
              ))}
            </select>
            <p className="text-sm text-muted-foreground">{t.fields[m].hint}</p>
          </div>
        ))}
      </div>
      <Link href="/size-guide" className="self-start text-sm underline underline-offset-4 hover:text-muted-foreground">
        {t.howToMeasure}
      </Link>
    </div>
  );
}
