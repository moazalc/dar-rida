"use client";

import { useState, useTransition } from "react";
import { checkout } from "@/app/(frontend)/cart/actions";
import { statusAction } from "@/components/status-page";
import { useI18n } from "@/components/providers/i18n-provider";

/** Starts Stripe Checkout; the action redirects there, so we only handle failure here. */
export function CheckoutButton({ disabled }: { disabled: boolean }) {
  const t = useI18n().dict.cart;
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-7 flex flex-col gap-3">
      <button
        type="button"
        disabled={disabled || pending}
        onClick={() =>
          startTransition(async () => {
            setFailed(false);
            const result = await checkout();
            if (result) setFailed(true);
          })
        }
        className={`${statusAction.primary} w-full disabled:opacity-60`}
      >
        {pending ? t.checkingOut : t.checkout}
      </button>
      <p aria-live="polite" className="text-sm text-destructive">
        {failed ? t.checkoutError : ""}
      </p>
    </div>
  );
}
