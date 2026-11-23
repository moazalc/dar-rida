"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** First visit only: confirm the country we guessed, or change it. */
export function MarketNote({
  countryName,
  onChange,
  onDismiss,
  labels,
  className,
}: {
  countryName: string;
  onChange: () => void;
  onDismiss: () => void;
  labels: { question: string; change: string; dismiss: string };
  className?: string;
}) {
  const question = labels.question.replace("{country}", countryName);
  return (
    <section
      aria-label={question}
      className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 border border-line-strong bg-card px-4 py-3", className)}
    >
      <p className="text-body">{question}</p>
      <div className="flex gap-2">
        <Button size="md" onClick={onDismiss}>
          {labels.dismiss}
        </Button>
        <Button size="md" variant="secondary" onClick={onChange}>
          {labels.change}
        </Button>
      </div>
    </section>
  );
}
