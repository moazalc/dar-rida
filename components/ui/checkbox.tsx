import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A native checkbox inside a label row tall enough to tap (44px). */
export function Checkbox({ label, className, ...props }: Omit<ComponentProps<"input">, "type"> & { label: ReactNode }) {
  return (
    <label className={cn("flex min-h-11 cursor-pointer items-center gap-3 text-body", className)}>
      <input type="checkbox" className="size-5 shrink-0 accent-[var(--charcoal)]" {...props} />
      <span>{label}</span>
    </label>
  );
}
