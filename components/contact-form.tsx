"use client";

import { useId, useState } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { contact } from "@/lib/site";

const field = "h-12 w-full border border-border/70 bg-background px-3 text-base";

/**
 * Contact form with no server: sending opens her email app with the message
 * filled in. Stays closed until the house has an email address in lib/site.ts.
 */
export function ContactForm() {
  const t = useI18n().dict.info.contact.form;
  const id = useId();
  const [topic, setTopic] = useState<keyof typeof t.topics>("order");
  const open = !!contact.email;

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const name = String(data.get("name") ?? "");
        const subject = `${t.topics[topic]} — ${name}`;
        const body = `${data.get("message") ?? ""}\n\n${name}\n${data.get("email") ?? ""}`;
        window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }}
    >
      <h2 className="font-heading text-3xl">{t.title}</h2>
      <fieldset disabled={!open} className="flex flex-col gap-5 disabled:opacity-60">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor={`${id}-name`} className="text-sm">
              {t.name}
            </label>
            <input id={`${id}-name`} name="name" required autoComplete="name" className={field} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor={`${id}-email`} className="text-sm">
              {t.email}
            </label>
            <input id={`${id}-email`} name="email" type="email" required autoComplete="email" className={field} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-topic`} className="text-sm">
            {t.topic}
          </label>
          <select
            id={`${id}-topic`}
            value={topic}
            onChange={(e) => setTopic(e.target.value as keyof typeof t.topics)}
            className={field}
          >
            {(Object.keys(t.topics) as (keyof typeof t.topics)[]).map((k) => (
              <option key={k} value={k}>
                {t.topics[k]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-message`} className="text-sm">
            {t.message}
          </label>
          <textarea
            id={`${id}-message`}
            name="message"
            required
            rows={6}
            maxLength={2000}
            className="w-full border border-border/70 bg-background px-3 py-2 text-base"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-14 items-center justify-center self-start bg-primary px-12 text-sm tracking-[0.16em] text-primary-foreground uppercase transition-opacity hover:opacity-90"
        >
          {t.send}
        </button>
      </fieldset>
      <p className="text-sm text-muted-foreground">{open ? t.note : t.unavailable}</p>
    </form>
  );
}
