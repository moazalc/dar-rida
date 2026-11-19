"use client";

import { useState } from "react";
import { AccordionItem } from "@/components/accordion";

/** Composition, care and origin as folding sections, one open at a time. Empty ones are left out. */
export function ProductDetails({ items }: { items: { title: string; body: string | null }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const shown = items.filter((i): i is { title: string; body: string } => Boolean(i.body));
  if (!shown.length) return null;
  return (
    <div>
      {shown.map((item, i) => (
        <AccordionItem key={item.title} title={item.title} open={open === i} onToggle={() => setOpen(open === i ? null : i)}>
          <p className="leading-relaxed whitespace-pre-line text-muted-foreground">{item.body}</p>
        </AccordionItem>
      ))}
    </div>
  );
}
