"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { units, type Unit } from "@/lib/measurements";
import { cn } from "@/lib/utils";

/** The in / cm switch. `long` spells the units out ("Inches", "Centimetres"). */
export function UnitSwitch({
  value,
  onChange,
  long = false,
  className,
}: {
  value: Unit;
  onChange: (unit: Unit) => void;
  long?: boolean;
  className?: string;
}) {
  const t = useI18n().dict.measure;
  return (
    <div role="group" aria-label={t.unitSwitch} className={cn("inline-flex border border-border/70", className)}>
      {units.map((u) => (
        <button
          key={u}
          type="button"
          aria-pressed={value === u}
          onClick={() => onChange(u)}
          className={cn(
            "px-3 py-1 text-xs tracking-[0.12em] uppercase transition-colors",
            value === u ? "bg-primary text-primary-foreground" : "hover:bg-muted",
          )}
        >
          {long ? t.unitNames[u] : t.units[u]}
        </button>
      ))}
    </div>
  );
}
