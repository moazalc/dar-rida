"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { deleteAddress, makeDefaultAddress, saveAddress, type ActionResult } from "@/app/(frontend)/account/actions";
import { useI18n } from "@/components/providers/i18n-provider";
import type { AddressField } from "@/lib/account";
import { countryName, countryOptions, isCountry } from "@/lib/markets";
import { cn } from "@/lib/utils";

export type SavedAddress = {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

const small = "text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground disabled:opacity-50";
const empty = { name: "", phone: "", line1: "", line2: "", city: "", state: "", postalCode: "", country: "" };

/** Her saved addresses: add, edit, delete, and pick the default. */
export function AddressesManager({ addresses, defaultCountry }: { addresses: SavedAddress[]; defaultCountry: string | null }) {
  const { dict, locale } = useI18n();
  const t = dict.account.addresses;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  function act(run: () => Promise<ActionResult>) {
    setError(null);
    startTransition(async () => {
      const r = await run();
      if (r.status === "ok") router.refresh();
      else setError(t.error);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {addresses.length === 0 && editing !== "new" && <p className="text-muted-foreground">{t.empty}</p>}

      <ul className="grid gap-4 md:grid-cols-2">
        {addresses.map((a) =>
          editing === a.id ? (
            <li key={a.id} className="md:col-span-2">
              <AddressForm initial={a} onDone={() => (setEditing(null), router.refresh())} onCancel={() => setEditing(null)} id={a.id} />
            </li>
          ) : (
            <li key={a.id} className={cn("flex flex-col gap-3 border p-5", a.isDefault ? "border-foreground" : "border-border/70")}>
              <address className="text-sm not-italic">
                <span className="block font-medium">
                  <bdi>{a.name}</bdi>
                </span>
                <span className="block">
                  <bdi>{a.line1}</bdi>
                </span>
                {a.line2 && (
                  <span className="block">
                    <bdi>{a.line2}</bdi>
                  </span>
                )}
                <span className="block">
                  <bdi>{[a.city, a.state, a.postalCode].filter(Boolean).join(", ")}</bdi>
                </span>
                <span className="block">{isCountry(a.country) ? countryName(a.country, locale) : a.country}</span>
                {a.phone && (
                  <span dir="ltr" className="block rtl:text-end">
                    {a.phone}
                  </span>
                )}
              </address>
              <div className="mt-auto flex flex-wrap items-center gap-4">
                {a.isDefault ? (
                  <span className="text-xs tracking-[0.14em] uppercase">{t.isDefault}</span>
                ) : (
                  <button type="button" disabled={pending} onClick={() => act(() => makeDefaultAddress(a.id))} className={small}>
                    {t.makeDefault}
                  </button>
                )}
                <button type="button" onClick={() => setEditing(a.id)} className={small}>
                  {t.edit}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => window.confirm(t.confirmDelete) && act(() => deleteAddress(a.id))}
                  className={small}
                >
                  {t.delete}
                </button>
              </div>
            </li>
          ),
        )}
      </ul>

      {editing === "new" ? (
        <AddressForm
          initial={{ ...empty, country: defaultCountry ?? "" }}
          onDone={() => (setEditing(null), router.refresh())}
          onCancel={() => setEditing(null)}
          id={null}
        />
      ) : (
        addresses.length < 10 && (
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="h-12 self-start border border-foreground px-6 text-xs tracking-[0.16em] uppercase transition-colors hover:bg-foreground hover:text-background"
          >
            {t.add}
          </button>
        )
      )}
      <p aria-live="polite" className="text-sm text-destructive">
        {error}
      </p>
    </div>
  );
}

function AddressForm({
  initial,
  id,
  onDone,
  onCancel,
}: {
  initial: Omit<SavedAddress, "id" | "isDefault">;
  id: string | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const { dict, locale } = useI18n();
  const t = dict.account.addresses;
  const [values, setValues] = useState(initial);
  const [bad, setBad] = useState<AddressField[]>([]);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();
  const countries = useMemo(() => countryOptions(locale), [locale]);

  const field = (key: Exclude<AddressField, "country">, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="flex flex-col gap-1.5 text-sm">
      {t.fields[key]}
      <input
        value={values[key]}
        onChange={(e) => setValues({ ...values, [key]: e.target.value })}
        aria-invalid={bad.includes(key) || undefined}
        className="h-11 border border-border bg-card px-3 text-base outline-none focus:border-foreground aria-invalid:border-destructive"
        {...props}
      />
    </label>
  );

  return (
    <form
      className="grid gap-4 border border-border/70 p-5 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        setFailed(false);
        startTransition(async () => {
          const r = await saveAddress(id, values);
          if (r.status === "ok") onDone();
          else if (r.status === "invalid") setBad(r.fields);
          else setFailed(true);
        });
      }}
    >
      {field("name", { autoComplete: "name", required: true, maxLength: 120 })}
      {field("phone", { autoComplete: "tel", type: "tel", dir: "ltr", maxLength: 40 })}
      <div className="sm:col-span-2">{field("line1", { autoComplete: "address-line1", required: true, maxLength: 200 })}</div>
      <div className="sm:col-span-2">{field("line2", { autoComplete: "address-line2", maxLength: 200 })}</div>
      {field("city", { autoComplete: "address-level2", required: true, maxLength: 100 })}
      {field("state", { autoComplete: "address-level1", maxLength: 100 })}
      {field("postalCode", { autoComplete: "postal-code", maxLength: 20 })}
      <label className="flex flex-col gap-1.5 text-sm">
        {t.fields.country}
        <select
          value={values.country}
          required
          onChange={(e) => setValues({ ...values, country: e.target.value })}
          aria-invalid={bad.includes("country") || undefined}
          autoComplete="country"
          className="h-11 border border-border bg-card px-3 text-base aria-invalid:border-destructive"
        >
          <option value="" disabled>
            {t.fields.country}
          </option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      {(bad.length > 0 || failed) && <p className="text-sm text-destructive sm:col-span-2">{failed ? dict.account.profiles.error : t.error}</p>}
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="h-12 bg-primary px-7 text-sm tracking-[0.16em] text-primary-foreground uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {t.save}
        </button>
        <button type="button" onClick={onCancel} className={small}>
          {t.cancel}
        </button>
      </div>
    </form>
  );
}
