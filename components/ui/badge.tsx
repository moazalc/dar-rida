import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tones = {
  neutral: "border-line-strong text-foreground",
  gold: "border-gold text-foreground",
  success: "border-[#2f5d3a] text-[#2f5d3a]",
  danger: "border-destructive text-destructive",
} as const;

/** A small outlined label. Wraps rather than clipping long translations. */
export function Badge({ tone = "neutral", className, children }: { tone?: keyof typeof tones; className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2 py-0.5 text-caption tracking-[0.14em] uppercase",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
