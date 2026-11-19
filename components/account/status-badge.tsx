import type { CustomerStatus } from "@/lib/account";
import { cn } from "@/lib/utils";

const tone: Record<CustomerStatus, string> = {
  making: "bg-champagne/40 text-foreground",
  shipped: "bg-gold/25 text-foreground",
  delivered: "bg-muted text-muted-foreground",
  cancelled: "bg-muted text-muted-foreground line-through",
};

/** "Being made", "On its way"… as a small tag. */
export function StatusBadge({ status, label }: { status: CustomerStatus; label: string }) {
  return <span className={cn("inline-block px-2.5 py-1 text-xs tracking-[0.1em] uppercase", tone[status])}>{label}</span>;
}
