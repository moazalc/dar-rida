"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { chooseAddress } from "@/app/(frontend)/account/actions";
import { useI18n } from "@/components/providers/i18n-provider";
import { countryName, isCountry } from "@/lib/markets";

type Option = { id: string; name: string; line1: string; city: string; country: string };

/**
 * In the bag, for a signed-in customer with saved addresses: which one to ship
 * to. Choosing one also sets the country, so prices and shipping follow it.
 */
export function ShipTo({ addresses, selected }: { addresses: Option[]; selected: string | null }) {
  const { dict, locale } = useI18n();
  const t = dict.account.addresses;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const label = (a: Option) => `${a.name} — ${a.line1}, ${a.city}, ${isCountry(a.country) ? countryName(a.country, locale) : a.country}`;

  return (
    <label className="mt-5 flex flex-col gap-1.5 text-sm">
      <span className="text-muted-foreground">{t.shipTo}</span>
      <select
        value={selected ?? ""}
        disabled={pending}
        onChange={(e) => {
          const id = e.target.value;
          if (!id) return;
          startTransition(async () => {
            const r = await chooseAddress(id);
            if (r.status === "ok") router.refresh();
          });
        }}
        className="h-11 w-full border border-border bg-background px-3 text-sm disabled:opacity-60"
      >
        {!selected && (
          <option value="" disabled>
            {t.another}
          </option>
        )}
        {addresses.map((a) => (
          <option key={a.id} value={a.id}>
            {label(a)}
          </option>
        ))}
      </select>
    </label>
  );
}
