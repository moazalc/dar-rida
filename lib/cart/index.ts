import "server-only";

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { Cart, Design, Media } from "@/cms/payload-types";
import { describeConfig } from "@/lib/configurator/describe";
import type { Config } from "@/lib/configurator/options";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Measurements } from "@/lib/measurements";
import { mediaPath } from "@/lib/media";
import { payloadClient } from "@/lib/payload";
import { unitPrice, type PricedDesign } from "./pricing";

// The bag lives in the database, found by a random token in an httpOnly
// cookie. Only Server Actions may set the cookie, so reads never create a bag.

export const CART_COOKIE = "dr_cart";
const TOKEN = /^[A-Za-z0-9_-]{32,64}$/;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // matches how long untouched bags are kept

export type NewLine =
  | { kind: "design"; design: number; measurements: Measurements; notes: string; quantity: number }
  | { kind: "custom"; config: Config; measurements: Measurements; notes: string; quantity: number };

async function cartToken(): Promise<string | null> {
  const value = (await cookies()).get(CART_COOKIE)?.value;
  return value && TOKEN.test(value) ? value : null;
}

/** The current visitor's bag, or null if they have none yet. */
export async function findCart(depth = 0): Promise<Cart | null> {
  const token = await cartToken();
  if (!token) return null;
  const payload = await payloadClient();
  const { docs } = await payload.find({ collection: "carts", where: { token: { equals: token } }, limit: 1, depth });
  return docs[0] ?? null;
}

/** For Server Actions: the visitor's bag, created (and its cookie set) on first use. */
export async function findOrCreateCart(): Promise<Cart> {
  const existing = await findCart();
  const store = await cookies();
  const token = existing?.token ?? randomBytes(24).toString("base64url");
  // Refresh the cookie on every change, so an active bag never expires.
  store.set(CART_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  if (existing) return existing;
  const payload = await payloadClient();
  // New bags are a natural moment to clear out ones untouched for a month.
  const cutoff = new Date(Date.now() - COOKIE_MAX_AGE * 1000).toISOString();
  await payload
    .delete({ collection: "carts", where: { updatedAt: { less_than: cutoff } } })
    .catch((error) => console.error("Pruning old bags failed", error));
  return payload.create({ collection: "carts", data: { token, lines: [] } });
}

type StoredLine = NonNullable<Cart["lines"]>[number];

function plainLines(cart: Cart): StoredLine[] {
  return (cart.lines ?? []).map((l) => ({
    ...l,
    design: typeof l.design === "object" && l.design ? l.design.id : l.design,
  }));
}

async function saveLines(cart: Cart, lines: StoredLine[]) {
  const payload = await payloadClient();
  await payload.update({ collection: "carts", id: cart.id, data: { lines } });
}

export async function addLine(line: NewLine) {
  const cart = await findOrCreateCart();
  const lines = plainLines(cart);
  if (lines.length >= 20) throw new Error("Bag is full");
  lines.push(
    line.kind === "design"
      ? { kind: "design", design: line.design, measurements: line.measurements, notes: line.notes, quantity: line.quantity }
      : { kind: "custom", config: line.config, measurements: line.measurements, notes: line.notes, quantity: line.quantity },
  );
  await saveLines(cart, lines);
}

/** Set a line's quantity; 0 removes it. Unknown line ids are ignored. */
export async function setLineQuantity(lineId: string, quantity: number) {
  const cart = await findCart();
  if (!cart) return;
  const lines = plainLines(cart);
  const next =
    quantity === 0 ? lines.filter((l) => l.id !== lineId) : lines.map((l) => (l.id === lineId ? { ...l, quantity } : l));
  await saveLines(cart, next);
}

/** How many pieces are in the bag, for the header badge. Never throws: a broken badge must not break a page. */
export async function cartCount(): Promise<number> {
  try {
    const cart = await findCart();
    return Math.min((cart?.lines ?? []).reduce((n, l) => n + l.quantity, 0), 99);
  } catch (error) {
    console.error("Reading the bag count failed", error);
    return 0;
  }
}

export type BagLine = {
  id: string;
  kind: "design" | "custom";
  href: string;
  code: string | null;
  name: string;
  /** English name, for the order snapshot. */
  nameEn: string;
  nameAr: string | null;
  drawing: Design["drawing"] | null;
  image: { url: string; alt: string; width: number; height: number } | null;
  config: Config | null;
  choices: { label: string; value: string }[];
  measurements: Measurements;
  notes: string;
  quantity: number;
  /** Cents, or null when it can no longer be bought. */
  unitPrice: number | null;
  designId: number | null;
};

export type Bag = {
  cart: Cart;
  lines: BagLine[];
  count: number;
  /** Cents. */
  subtotal: number;
  /** Every line can be bought. */
  ready: boolean;
};

/**
 * The bag with names, pictures and prices filled in for the given language.
 * Prices come from the designs and store settings as they are now.
 */
export async function loadBag(locale: Locale, dict: Dictionary): Promise<Bag | null> {
  const cart = await findCart();
  if (!cart || !cart.lines?.length) return cart ? { cart, lines: [], count: 0, subtotal: 0, ready: false } : null;
  return priceCart(cart, locale, dict);
}

export async function priceCart(cart: Cart, locale: Locale, dict: Dictionary, dictEn?: Dictionary): Promise<Bag> {
  const payload = await payloadClient();
  const stored = plainLines(cart);
  const ids = [...new Set(stored.map((l) => l.design).filter((id): id is number => typeof id === "number"))];

  const [local, english, ar, settings] = await Promise.all([
    ids.length
      ? payload.find({ collection: "designs", where: { id: { in: ids } }, locale, depth: 1, limit: ids.length })
      : null,
    ids.length ? payload.find({ collection: "designs", where: { id: { in: ids } }, locale: "en", depth: 0, limit: ids.length }) : null,
    ids.length ? payload.find({ collection: "designs", where: { id: { in: ids } }, locale: "ar", depth: 0, limit: ids.length }) : null,
    payload.findGlobal({ slug: "store-settings" }),
  ]);

  const designs = new Map<number, Design>((local?.docs ?? []).map((d) => [d.id, d]));
  const namesEn = new Map((english?.docs ?? []).map((d) => [d.id, d.name]));
  const namesAr = new Map((ar?.docs ?? []).map((d) => [d.id, d.name]));
  const priced = new Map<number, PricedDesign>([...designs].map(([id, d]) => [id, d]));

  const lines: BagLine[] = stored.map((l) => {
    const price = unitPrice({ kind: l.kind, design: l.design as number | null, quantity: l.quantity }, priced, settings.customAbayaPrice);
    const base = {
      id: l.id ?? "",
      kind: l.kind,
      measurements: l.measurements,
      notes: l.notes ?? "",
      quantity: l.quantity,
      unitPrice: price,
    };
    if (l.kind === "custom") {
      const choices = describeConfig(l.config, dict);
      return {
        ...base,
        href: "/design",
        code: null,
        name: dict.cart.customName,
        nameEn: (dictEn ?? dict).cart.customName,
        nameAr: null,
        drawing: null,
        image: null,
        config: (l.config as Config) ?? null,
        choices,
        designId: null,
      };
    }
    const design = typeof l.design === "number" ? designs.get(l.design) : undefined;
    const photo = design?.images?.find((m): m is Media => typeof m === "object" && m !== null);
    return {
      ...base,
      href: design ? `/collection/${design.slug}` : "/collection",
      code: design?.code ?? null,
      name: design?.name ?? dict.cart.unavailable,
      nameEn: (design && namesEn.get(design.id)) || design?.name || "Unavailable design",
      nameAr: (design && namesAr.get(design.id)) || null,
      drawing: design?.drawing ?? null,
      image:
        photo?.url && photo.width && photo.height
          ? { url: mediaPath(photo.url), alt: photo.alt ?? design?.name ?? "", width: photo.width, height: photo.height }
          : null,
      config: null,
      choices: [],
      designId: design?.id ?? null,
    };
  });

  return {
    cart,
    lines,
    count: lines.reduce((n, l) => n + l.quantity, 0),
    subtotal: lines.reduce((sum, l) => sum + (l.unitPrice ?? 0) * l.quantity, 0),
    ready: lines.length > 0 && lines.every((l) => l.unitPrice !== null),
  };
}

/** Empty the bag with this token (after its order is paid). */
export async function emptyCartByToken(token: string) {
  const payload = await payloadClient();
  await payload.update({
    collection: "carts",
    where: { token: { equals: token } },
    data: { lines: [], pendingOrder: null },
  });
}
