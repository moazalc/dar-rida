import { cn } from "@/lib/utils";

/** A champagne hairline; `ornament` adds a small gold diamond at its centre. */
export function Divider({ ornament = false, className }: { ornament?: boolean; className?: string }) {
  if (!ornament) return <hr className={cn("border-0 border-t border-champagne", className)} />;
  return (
    <div role="separator" className={cn("flex items-center gap-4", className)}>
      <span className="h-px flex-1 bg-champagne" />
      <span aria-hidden="true" className="size-1.5 rotate-45 bg-gold" />
      <span className="h-px flex-1 bg-champagne" />
    </div>
  );
}
