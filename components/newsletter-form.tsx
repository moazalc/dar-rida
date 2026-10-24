"use client";

import { useId, useState } from "react";
import { useDict } from "@/components/providers/i18n-provider";

/**
 * Footer sign-up. Not wired to anything yet — it will subscribe through
 * Shopify (customer with marketing consent) once the store is connected.
 * Until then it says so instead of pretending to have signed anyone up.
 */
export function NewsletterForm() {
  const t = useDict().footer.newsletter;
  const id = useId();
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <label htmlFor={id} className="font-heading text-3xl leading-tight md:text-4xl">
        {t.title}
      </label>
      <div className="flex items-center border-b border-foreground">
        <input
          id={id}
          type="email"
          required
          autoComplete="email"
          placeholder={t.placeholder}
          className="min-w-0 flex-1 bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          className="py-3 text-sm tracking-[0.2em] uppercase transition-opacity hover:opacity-60"
        >
          {t.submit}
        </button>
      </div>
      <p aria-live="polite" className="min-h-6 text-sm text-muted-foreground">
        {submitted ? t.soon : null}
      </p>
    </form>
  );
}
