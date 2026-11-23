import { cn } from "@/lib/utils";

/** A placeholder block while content loads. Hidden from screen readers. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-lg bg-muted", className)} />;
}
