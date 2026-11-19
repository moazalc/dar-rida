"use client";

import { useState, useTransition } from "react";
import { saveDetails } from "@/app/(frontend)/account/actions";
import { useI18n } from "@/components/providers/i18n-provider";

const input = "h-11 border border-border bg-card px-3 text-base outline-none focus:border-foreground";

/** Name and phone; the email is shown but is how she signs in, so it isn't edited here. */
export function DetailsForm({ email, name: initialName, phone: initialPhone }: { email: string; name: string; phone: string }) {
  const { dict } = useI18n();
  const t = dict.account.details;
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [state, setState] = useState<"idle" | "saved" | "error">("idle");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex max-w-md flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const r = await saveDetails({ name, phone });
          setState(r.status === "ok" ? "saved" : "error");
        });
      }}
    >
      <label className="flex flex-col gap-1.5 text-sm">
        {t.email}
        <input value={email} readOnly dir="ltr" className={`${input} text-muted-foreground`} />
        <span className="text-muted-foreground">{t.emailNote}</span>
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        {t.name}
        <input value={name} maxLength={120} autoComplete="name" onChange={(e) => (setName(e.target.value), setState("idle"))} className={input} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        {t.phone}
        <input
          value={phone}
          maxLength={40}
          type="tel"
          dir="ltr"
          autoComplete="tel"
          onChange={(e) => (setPhone(e.target.value), setState("idle"))}
          className={input}
        />
      </label>
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="h-12 bg-primary px-7 text-sm tracking-[0.16em] text-primary-foreground uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {t.save}
        </button>
        <p aria-live="polite" className={state === "error" ? "text-sm text-destructive" : "text-sm"}>
          {state === "saved" ? t.saved : state === "error" ? t.error : null}
        </p>
      </div>
    </form>
  );
}
