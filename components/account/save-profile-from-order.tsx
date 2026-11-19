"use client";

import { useState, useTransition } from "react";
import { profileFromOrder } from "@/app/(frontend)/account/actions";
import { useI18n } from "@/components/providers/i18n-provider";

/** "Save these measurements" under an order line: asks for a name, then saves it as a profile. */
export function SaveProfileFromOrder({ order, line, defaultName }: { order: string; line: string; defaultName: string }) {
  const { dict } = useI18n();
  const t = dict.account;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const [state, setState] = useState<"idle" | "saved" | "error" | "full">("idle");
  const [pending, startTransition] = useTransition();

  if (state === "saved") return <p className="text-sm">{t.order.saved}</p>;
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="self-start text-sm underline underline-offset-4 hover:text-muted-foreground">
        {t.order.saveProfile}
      </button>
    );
  }
  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const r = await profileFromOrder({ order, line, name });
          setState(r.status === "ok" ? "saved" : r.status === "full" ? "full" : "error");
        });
      }}
    >
      <label className="sr-only" htmlFor={`profile-${line}`}>
        {t.profiles.name}
      </label>
      <input
        id={`profile-${line}`}
        value={name}
        maxLength={40}
        required
        onChange={(e) => setName(e.target.value)}
        placeholder={t.profiles.namePlaceholder}
        className="h-10 w-44 border border-border bg-card px-3 text-sm outline-none focus:border-foreground"
      />
      <button type="submit" disabled={pending || !name.trim()} className="h-10 bg-primary px-4 text-xs tracking-[0.12em] text-primary-foreground uppercase disabled:opacity-50">
        {t.profiles.save}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted-foreground underline underline-offset-4">
        {t.profiles.cancel}
      </button>
      {state === "error" && <p className="w-full text-sm text-destructive">{t.profiles.error}</p>}
      {state === "full" && <p className="w-full text-sm text-destructive">{t.profiles.full}</p>}
    </form>
  );
}
