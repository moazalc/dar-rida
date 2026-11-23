"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Customer } from "@/cms/payload-types";
import { ADDRESS_COOKIE, cleanProfileName, cleanText, MAX_PROFILES, parseAddress, type AddressField } from "@/lib/account";
import { getAuth } from "@/lib/auth";
import { forgetBag } from "@/lib/cart";
import { getCustomer } from "@/lib/customers";
import { localePath } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/locale";
import { COUNTRY_COOKIE } from "@/lib/markets";
import { parseMeasurements } from "@/lib/measurements";
import { payloadClient } from "@/lib/payload";

// Server Actions are public endpoints: each one finds the signed-in customer
// itself and only ever changes that customer's own record.

export type ActionResult = { status: "ok" } | { status: "error" } | { status: "signed-out" } | { status: "full" };
export type AddressResult = ActionResult | { status: "invalid"; fields: AddressField[] };

type Profile = NonNullable<Customer["profiles"]>[number];
type Address = NonNullable<Customer["addresses"]>[number];

async function update(customer: Customer, data: Partial<Pick<Customer, "profiles" | "addresses" | "name" | "phone">>) {
  const payload = await payloadClient();
  await payload.update({ collection: "customers", id: customer.id, data, depth: 0 });
  revalidatePath("/", "layout");
}

async function run(change: (customer: Customer) => Promise<ActionResult | void>): Promise<ActionResult> {
  const customer = await getCustomer();
  if (!customer) return { status: "signed-out" };
  try {
    return (await change(customer)) ?? { status: "ok" };
  } catch (error) {
    console.error("Updating a customer account failed", error);
    return { status: "error" };
  }
}

const isRowId = (id: unknown): id is string => typeof id === "string" && /^[a-f0-9]{24}$/.test(id);

// --- Signing out -------------------------------------------------------------

/** Sign out here, or everywhere. The bag cookie goes too, so a shared phone starts clean. */
export async function signOut(everywhere = false) {
  const auth = await getAuth();
  const h = await headers();
  try {
    if (everywhere === true) await auth.api.revokeSessions({ headers: h });
    await auth.api.signOut({ headers: h });
  } catch (error) {
    console.error("Signing out failed", error);
  }
  await forgetBag();
  (await cookies()).delete(ADDRESS_COOKIE);
  revalidatePath("/", "layout");
  redirect(localePath(await getLocale(), "/"));
}

// --- Measurement profiles -----------------------------------------------------

/** Save a new set of measurements under a name. */
export async function addProfile(input: { name: unknown; measurements: unknown }): Promise<ActionResult> {
  const name = cleanProfileName(input?.name);
  const measurements = parseMeasurements(input?.measurements);
  if (!name || !measurements) return { status: "error" };
  return run(async (customer) => {
    const profiles = customer.profiles ?? [];
    if (profiles.length >= MAX_PROFILES) return { status: "full" };
    await update(customer, { profiles: [...profiles, { name, measurements }] });
  });
}

/** Rename a profile, or replace its measurements. */
export async function editProfile(id: unknown, input: { name?: unknown; measurements?: unknown }): Promise<ActionResult> {
  if (!isRowId(id)) return { status: "error" };
  const name = input?.name === undefined ? undefined : cleanProfileName(input.name);
  const measurements = input?.measurements === undefined ? undefined : parseMeasurements(input.measurements);
  if (name === null || measurements === null) return { status: "error" };
  return run(async (customer) => {
    const profiles = customer.profiles ?? [];
    if (!profiles.some((p) => p.id === id)) return { status: "error" };
    await update(customer, {
      profiles: profiles.map((p): Profile => (p.id === id ? { ...p, ...(name && { name }), ...(measurements && { measurements }) } : p)),
    });
  });
}

export async function deleteProfile(id: unknown): Promise<ActionResult> {
  if (!isRowId(id)) return { status: "error" };
  return run(async (customer) => {
    await update(customer, { profiles: (customer.profiles ?? []).filter((p) => p.id !== id) });
  });
}

/** Save the measurements of a line on one of her own orders as a profile. */
export async function profileFromOrder(input: { order: unknown; line: unknown; name: unknown }): Promise<ActionResult> {
  const name = cleanProfileName(input?.name);
  if (!name || typeof input?.order !== "string" || !/^DR-\d{1,10}$/.test(input.order) || !isRowId(input?.line)) {
    return { status: "error" };
  }
  return run(async (customer) => {
    const payload = await payloadClient();
    const { docs } = await payload.find({
      collection: "orders",
      where: {
        and: [
          { number: { equals: input.order } },
          { or: [{ customer: { equals: customer.id } }, { customerEmail: { equals: customer.email } }] },
        ],
      },
      limit: 1,
      depth: 0,
    });
    const line = docs[0]?.lines?.find((l) => l.id === input.line);
    const measurements = line ? parseMeasurements(line.measurements) : null;
    if (!measurements) return { status: "error" };
    const profiles = customer.profiles ?? [];
    if (profiles.length >= MAX_PROFILES) return { status: "full" };
    await update(customer, { profiles: [...profiles, { name, measurements }] });
  });
}

// --- Addresses ----------------------------------------------------------------

/** Exactly one default whenever there are addresses. */
function withDefault(addresses: Address[], defaultId?: string | null): Address[] {
  const target = defaultId && addresses.some((a) => a.id === defaultId) ? defaultId : (addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id);
  return addresses.map((a, i) => ({ ...a, isDefault: target ? a.id === target : i === 0 }));
}

/** Add an address (no id) or change one. The first address becomes the default. */
export async function saveAddress(id: unknown, input: Record<string, unknown>): Promise<AddressResult> {
  if (id !== null && !isRowId(id)) return { status: "error" };
  const parsed = parseAddress(input ?? {});
  if (!parsed.ok) return { status: "invalid", fields: parsed.fields };
  return run(async (customer) => {
    const addresses = customer.addresses ?? [];
    if (id === null) {
      if (addresses.length >= 10) return { status: "full" };
      const next = [...addresses, { ...parsed.address, isDefault: addresses.length === 0 }];
      await update(customer, { addresses: withDefault(next) });
      return;
    }
    if (!addresses.some((a) => a.id === id)) return { status: "error" };
    await update(customer, { addresses: withDefault(addresses.map((a) => (a.id === id ? { ...a, ...parsed.address } : a))) });
  });
}

export async function deleteAddress(id: unknown): Promise<ActionResult> {
  if (!isRowId(id)) return { status: "error" };
  return run(async (customer) => {
    await update(customer, { addresses: withDefault((customer.addresses ?? []).filter((a) => a.id !== id)) });
  });
}

export async function makeDefaultAddress(id: unknown): Promise<ActionResult> {
  if (!isRowId(id)) return { status: "error" };
  return run(async (customer) => {
    await update(customer, { addresses: withDefault(customer.addresses ?? [], id) });
  });
}

/** In the bag: ship to this saved address. Its country sets the market, as the country switcher does. */
export async function chooseAddress(id: unknown): Promise<ActionResult> {
  if (!isRowId(id)) return { status: "error" };
  return run(async (customer) => {
    const address = (customer.addresses ?? []).find((a) => a.id === id);
    if (!address) return { status: "error" };
    const store = await cookies();
    const year = { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" as const };
    store.set(COUNTRY_COOKIE, address.country, year);
    store.set(ADDRESS_COOKIE, id, { ...year, httpOnly: true });
    revalidatePath("/", "layout");
  });
}

// --- Details ------------------------------------------------------------------

export async function saveDetails(input: { name: unknown; phone: unknown }): Promise<ActionResult> {
  const name = cleanText(input?.name, 120);
  const phone = cleanText(input?.phone, 40);
  return run(async (customer) => {
    await update(customer, { name: name || null, phone: phone || null });
  });
}

