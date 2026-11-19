"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * One folding section with a smooth open and close: the body's height eases
 * open (a grid row going from 0fr to 1fr), the text fades in a beat later, and
 * the plus turns into a minus. Controlled, so a list can keep one open at a time.
 */
export function AccordionItem({
  open,
  onToggle,
  title,
  children,
  className,
  buttonClassName,
}: {
  open: boolean;
  onToggle: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  buttonClassName?: string;
}) {
  const id = useId();
  return (
    <div className={cn("border-t border-border/70 last:border-b", className)}>
      <h3>
        <button
          type="button"
          id={`${id}-button`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={onToggle}
          className={cn(
            "flex w-full items-center justify-between gap-4 py-4 text-start text-xs tracking-[0.18em] uppercase",
            buttonClassName,
          )}
        >
          {title}
          <span aria-hidden className="relative size-3 shrink-0">
            <span className="absolute inset-x-0 top-1/2 h-px bg-current" />
            <span
              className={cn(
                "absolute inset-x-0 top-1/2 h-px bg-current transition-transform duration-500 ease-[cubic-bezier(.2,.7,.2,1)]",
                open ? "rotate-0" : "rotate-90",
              )}
            />
          </span>
        </button>
      </h3>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-button`}
        inert={!open}
        className={cn(
          "grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              "pb-5 transition-[opacity,translate] duration-500 motion-reduce:transition-none",
              open ? "translate-y-0 opacity-100 delay-100" : "-translate-y-1 opacity-0",
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
