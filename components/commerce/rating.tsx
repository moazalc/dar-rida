import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Five stars filled to `value` (halves allowed), read out as `label`. */
export function Rating({ value, label, className }: { value: number; label: string; className?: string }) {
  return (
    <span role="img" aria-label={label} className={cn("inline-flex gap-0.5 text-gold", className)}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative inline-block size-4">
            <Star aria-hidden="true" className="absolute inset-0 size-4" />
            <span className="absolute inset-y-0 start-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star aria-hidden="true" className="size-4 fill-current" />
            </span>
          </span>
        );
      })}
    </span>
  );
}
