"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * A strip of values styled as a tailor's tape: one tick per value, the chosen
 * one filled. Scrolls the chosen value (or the middle) into view when shown.
 */
export function Tape({
  values,
  value,
  format,
  onChange,
  label,
  className,
}: {
  values: readonly number[];
  value: number | undefined;
  format: (v: number) => string;
  onChange: (v: number) => void;
  label: string;
  className?: string;
}) {
  const strip = useRef<HTMLDivElement>(null);
  const target = value ?? values[Math.floor(values.length / 2)];

  useEffect(() => {
    // Centre the value by scrolling the strip only (scrollIntoView would also scroll the page).
    // Measured from the rendered boxes, so it works the same right to left.
    const box = strip.current;
    const el = box?.querySelector<HTMLElement>(`[data-v="${target}"]`);
    if (!box || !el) return;
    const a = el.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    box.scrollLeft += a.left + a.width / 2 - (b.left + b.width / 2);
    // Only when the list changes (a new step or unit), not on every pick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  return (
    <div
      ref={strip}
      role="group"
      aria-label={label}
      className={cn("flex overflow-x-auto border-y border-champagne bg-muted [scrollbar-width:thin]", className)}
    >
      {values.map((v) => (
        <button
          key={v}
          type="button"
          data-v={v}
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={cn(
            "relative h-14 min-w-12 shrink-0 px-1.5 pt-3.5 text-sm tabular-nums transition-colors before:absolute before:start-1/2 before:top-0 before:h-2.5 before:w-px before:bg-champagne",
            value === v ? "bg-primary text-primary-foreground" : "hover:bg-linen",
          )}
        >
          <bdi>{format(v)}</bdi>
        </button>
      ))}
    </div>
  );
}
