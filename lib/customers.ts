import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { Customer } from "@/cms/payload-types";
import { parseMeasurements, type Measurements } from "@/lib/measurements";
import { payloadClient } from "@/lib/payload";

type AuthUser = { id: string; email: string; name?: string | null };

/**
 * The shop's record for a signed-in person, made on first sign-in. Safe to
 * call again: it finds the existing record by sign-in ID, or by email when a
 * record was made before (and then links it).
 */
export async function ensureCustomer(user: AuthUser): Promise<Customer> {
  const payload = await payloadClient();
  const email = user.email.trim().toLowerCase();
  const found = await payload.find({
    collection: "customers",
    where: { or: [{ authUserId: { equals: user.id } }, { email: { equals: email } }] },
    limit: 1,
    depth: 0,
  });
  const existing = found.docs[0];
  if (existing) {
    if (existing.authUserId === user.id) return existing;
    return payload.update({ collection: "customers", id: existing.id, data: { authUserId: user.id }, depth: 0 });
  }
  // Google gives a name; an email-code sign-in gives none (Better Auth stores "").
  const name = user.name?.trim() || undefined;
  try {
    return await payload.create({ collection: "customers", data: { email, authUserId: user.id, name }, depth: 0 });
  } catch (error) {
    // Two requests on the first sign-in can race; the other one made it.
    const again = await payload.find({ collection: "customers", where: { authUserId: { equals: user.id } }, limit: 1, depth: 0 });
    if (again.docs[0]) return again.docs[0];
    throw error;
  }
}

/** Better Auth's view of who is signed in, or null. */
export const getSessionUser = cache(async (): Promise<AuthUser | null> => {
  const { getAuth } = await import("@/lib/auth");
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
});

/** The signed-in customer, or null for a guest. Once per request. */
export const getCustomer = cache(async (): Promise<Customer | null> => {
  const user = await getSessionUser();
  return user ? ensureCustomer(user) : null;
});

/** For account pages: the signed-in customer, or off to sign in and back to `path`. */
export async function requireCustomer(path: string): Promise<Customer> {
  const customer = await getCustomer();
  if (!customer) redirect(`/account/sign-in?next=${encodeURIComponent(path)}`);
  return customer;
}

/** Her orders: placed while signed in, or as a guest with the same email. Unpaid checkouts are left out. */
export async function customerOrders(customer: Customer) {
  const payload = await payloadClient();
  const { docs } = await payload.find({
    collection: "orders",
    where: {
      and: [
        { or: [{ customer: { equals: customer.id } }, { customerEmail: { equals: customer.email } }] },
        { status: { not_equals: "pending_payment" } },
      ],
    },
    sort: "-createdAt",
    limit: 100,
    depth: 0,
  });
  return docs;
}

/** One of her own orders by number, or null (also for anyone else's order). */
export async function customerOrder(customer: Customer, number: string) {
  if (!/^DR-\d{1,10}$/.test(number)) return null;
  const payload = await payloadClient();
  const { docs } = await payload.find({
    collection: "orders",
    where: {
      and: [
        { number: { equals: number } },
        { or: [{ customer: { equals: customer.id } }, { customerEmail: { equals: customer.email } }] },
        { status: { not_equals: "pending_payment" } },
      ],
    },
    limit: 1,
    depth: 0,
  });
  return docs[0] ?? null;
}

/** Her saved measurement sets, checked against today's allowed values. Null for a guest. */
export async function savedProfiles(): Promise<{ id: string; name: string; measurements: Measurements }[] | null> {
  const customer = await getCustomer().catch(() => null);
  if (!customer) return null;
  return (customer.profiles ?? []).flatMap((p) => {
    const measurements = parseMeasurements(p.measurements);
    return p.id && measurements ? [{ id: p.id, name: p.name, measurements }] : [];
  });
}

/** Her saved addresses, default first, with empty strings for missing parts. */
export function addressList(customer: Customer) {
  return (customer.addresses ?? [])
    .filter((a): a is typeof a & { id: string } => Boolean(a.id))
    .map((a) => ({
      id: a.id,
      name: a.name,
      phone: a.phone ?? "",
      line1: a.line1,
      line2: a.line2 ?? "",
      city: a.city,
      state: a.state ?? "",
      postalCode: a.postalCode ?? "",
      country: a.country,
      isDefault: Boolean(a.isDefault),
    }))
    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
}
