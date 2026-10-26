"use client";

import { useFormStatus } from "react-dom";
import { Minus, Plus } from "lucide-react";
import { updateLine } from "@/app/cart/actions";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

function Step({ quantity, label, children }: { quantity: number; label: string; children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="quantity"
      value={quantity}
      disabled={pending}
      aria-label={label}
      className="inline-flex size-10 items-center justify-center transition-opacity hover:opacity-60 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function Quantity({ quantity }: { quantity: number }) {
  const { pending } = useFormStatus();
  const { locale } = useI18n();
  return (
    <span aria-live="polite" className={cn("w-8 text-center tabular-nums", pending && "opacity-40")}>
      {quantity.toLocaleString(locale)}
    </span>
  );
}

function Remove({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="quantity"
      value={0}
      disabled={pending}
      className="text-xs tracking-[0.14em] text-muted-foreground uppercase underline-offset-4 hover:text-foreground hover:underline disabled:opacity-40"
    >
      {label}
    </button>
  );
}

/** Quantity stepper and remove link for one bag line. Plain forms: work before JS loads. */
export function LineControls({ lineId, quantity }: { lineId: string; quantity: number }) {
  const t = useI18n().dict.cart;
  return (
    <div className="flex items-center gap-5">
      <form action={updateLine} className="flex items-center border border-border/70">
        <input type="hidden" name="lineId" value={lineId} />
        <Step quantity={quantity - 1} label={t.decrease}>
          <Minus className="size-3.5" strokeWidth={1.5} />
        </Step>
        <Quantity quantity={quantity} />
        <Step quantity={quantity + 1} label={t.increase}>
          <Plus className="size-3.5" strokeWidth={1.5} />
        </Step>
      </form>
      <form action={updateLine}>
        <input type="hidden" name="lineId" value={lineId} />
        <Remove label={t.remove} />
      </form>
    </div>
  );
}
