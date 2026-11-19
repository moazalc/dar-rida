// Small rules for customer accounts, kept free of server imports so they can
// be tested on their own and used from client code.

import { isCountry, type Country } from "@/lib/markets";

/** Where to go after signing in: a path on this site only, never another site. */
export function safeNext(next: unknown, fallback = "/account"): string {
  if (typeof next !== "string" || next.length > 500) return fallback;
  // "/x" is fine; "//evil.com", "/\evil.com" and "https://…" are not.
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  if (/[\u0000-\u001f]/.test(next)) return fallback;
  return next;
}

export type CustomerStatus = "making" | "shipped" | "delivered" | "cancelled";

/** How an order's status reads to the customer. Unpaid orders are not shown at all (null). */
export function customerStatus(status: string): CustomerStatus | null {
  switch (status) {
    case "paid":
    case "in_production":
      return "making";
    case "shipped":
      return "shipped";
    case "completed":
      return "delivered";
    case "cancelled":
      return "cancelled";
    default:
      return null;
  }
}

/** The cookie holding which saved address the bag ships to (an address row id). */
export const ADDRESS_COOKIE = "dr_address";

export const MAX_BAG_LINES = 20;

/**
 * The account's bag after signing in on a device that had its own: the
 * account's lines first, then the device's, up to the bag's limit. Line ids
 * are dropped from the moved lines so the database gives them new ones.
 */
export function mergeLines<L extends { id?: string | null }>(account: L[], device: L[], max = MAX_BAG_LINES): L[] {
  const moved = device.map((line) => {
    const copy = { ...line };
    delete copy.id;
    return copy;
  });
  return [...account, ...moved].slice(0, max);
}

type AddressLike = { id?: string | null; country: string; isDefault?: boolean | null };

/**
 * The saved address checkout starts from: the one chosen in the bag, if it is
 * in the country being shipped to; else the default, then any address in that
 * country. Null when none is in that country (the customer types one at Stripe).
 */
export function pickAddress<A extends AddressLike>(addresses: A[], country: string | null, chosenId?: string | null): A | null {
  if (!country) return null;
  const here = addresses.filter((a) => a.country === country);
  return here.find((a) => chosenId && a.id === chosenId) ?? here.find((a) => a.isDefault) ?? here[0] ?? null;
}

export type AddressInput = {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: Country;
};

export type AddressField = keyof AddressInput;

const limits: Record<AddressField, [required: boolean, max: number]> = {
  name: [true, 120],
  phone: [false, 40],
  line1: [true, 200],
  line2: [false, 200],
  city: [true, 100],
  state: [false, 100],
  postalCode: [false, 20],
  country: [true, 2],
};

/** Check an address from a form. Returns the clean address, or the fields that need fixing. */
export function parseAddress(input: Record<string, unknown>): { ok: true; address: AddressInput } | { ok: false; fields: AddressField[] } {
  const out: Record<string, string> = {};
  const bad: AddressField[] = [];
  for (const [key, [required, max]] of Object.entries(limits) as [AddressField, [boolean, number]][]) {
    const raw = input[key];
    const value = typeof raw === "string" ? raw.trim().replace(/\s+/g, " ") : "";
    if ((required && !value) || value.length > max) bad.push(key);
    out[key] = value;
  }
  out.country = out.country.toUpperCase();
  if (!isCountry(out.country) && !bad.includes("country")) bad.push("country");
  return bad.length ? { ok: false, fields: bad } : { ok: true, address: out as AddressInput };
}

export const MAX_PROFILES = 10;

/** A profile name: trimmed, 1–40 characters. */
export function cleanProfileName(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const name = input.trim().replace(/\s+/g, " ");
  return name.length >= 1 && name.length <= 40 ? name : null;
}

/** A name or phone from the details form: trimmed and capped. */
export function cleanText(input: unknown, max: number): string {
  return typeof input === "string" ? input.trim().replace(/\s+/g, " ").slice(0, max) : "";
}
