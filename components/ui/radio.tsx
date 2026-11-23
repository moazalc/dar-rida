import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A native radio inside a label row tall enough to tap (44px). Group them in a fieldset with a legend. */
export function Radio({ label, className, ...props }: Omit<ComponentProps<"input">, "type"> & { label: ReactNode }) {
  return (
    <label className={cn("flex min-h-11 cursor-pointer items-center gap-3 text-body", className)}>
      <input type="radio" className="size-5 shrink-0 accent-[var(--charcoal)]" {...props} />
      <span>{label}</span>
    </label>
  );
}
