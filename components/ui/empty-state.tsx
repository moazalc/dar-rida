import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** What a page shows when there's nothing to list yet, with the next step. */
export function EmptyState({ title, body, action, className }: { title: ReactNode; body?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-4 px-6 py-16 text-center", className)}>
      <h2 className="font-heading text-h2">{title}</h2>
      {body ? <p className="max-w-prose text-body text-muted-foreground">{body}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
