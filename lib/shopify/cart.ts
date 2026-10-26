import "server-only";

import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n/config";
import { CART_COUNT_COOKIE } from "./cart-count";
import type { Money, ShopImage } from "./products";
import { isShopifyConfigured, ShopifyError, storefront } from "./storefront";

/** Cookie holding the visitor's Shopify cart id. */
const CART_COOKIE = "darrida_cart";
/** Shopify keeps idle carts for about 10 days. */
const CART_MAX_AGE = 60 * 60 * 24 * 14;

export type CartLineInput = {
  merchandiseId: string;
  quantity: number;
  /** Line item properties, shown on the order in Shopify admin. */
  attributes?: { key: string; value: string }[];
};

export type Cart = { id: string; checkoutUrl: string; totalQuantity: number };

export type CartLine = {
  id: string;
  quantity: number;
  attributes: { key: string; value: string }[];
  cost: { totalAmount: Money };
  merchandise: {
    id: string;
    title: string;
    image: ShopImage | null;
    selectedOptions: { name: string; value: string }[];
    product: { handle: string; title: string; tags: string[] };
  };
};

export type FullCart = Cart & {
  lines: CartLine[];
  cost: { subtotalAmount: Money; totalAmount: Money };
};

type CartPayload = { cart: Cart | null; userErrors: { message: string }[] };

const CART_FIELDS = "cart { id checkoutUrl totalQuantity } userErrors { message }";

const CREATE = `mutation cartCreate($lines: [CartLineInput!]!) {
  cartCreate(input: { lines: $lines }) { ${CART_FIELDS} }
}`;

const ADD = `mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) { ${CART_FIELDS} }
}`;

const UPDATE = `mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
  cartLinesUpdate(cartId: $cartId, lines: $lines) { ${CART_FIELDS} }
}`;

const REMOVE = `mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
  cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { ${CART_FIELDS} }
}`;

function unwrap(payload: CartPayload): Cart {
  if (payload.userErrors.length) throw new ShopifyError(payload.userErrors.map((e) => e.message).join("; "));
  if (!payload.cart) throw new ShopifyError("No cart returned");
  return payload.cart;
}

/** Remember the cart and its item count (the count feeds the header badge). */
async function remember(cart: Cart) {
  const store = await cookies();
  const options = { path: "/", sameSite: "lax" as const, maxAge: CART_MAX_AGE };
  store.set(CART_COOKIE, cart.id, { ...options, httpOnly: true, secure: process.env.NODE_ENV === "production" });
  store.set(CART_COUNT_COOKIE, String(cart.totalQuantity), options);
}

/**
 * Add lines to the visitor's cart, creating one if they have none (or theirs
 * has expired on Shopify's side), and remember its id in a cookie.
 */
export async function addToCart(lines: CartLineInput[]): Promise<Cart> {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;

  let cart: Cart | null = null;
  if (cartId) {
    try {
      const data = await storefront<{ cartLinesAdd: CartPayload }>(ADD, { cartId, lines });
      cart = unwrap(data.cartLinesAdd);
    } catch {
      cart = null; // Expired or unknown cart: start a fresh one below.
    }
  }
  if (!cart) {
    const data = await storefront<{ cartCreate: CartPayload }>(CREATE, { lines });
    cart = unwrap(data.cartCreate);
  }

  await remember(cart);
  return cart;
}

/** Set a line's quantity; zero removes it. */
export async function setLineQuantity(lineId: string, quantity: number): Promise<Cart> {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) throw new ShopifyError("No cart");
  const cart =
    quantity > 0
      ? unwrap((await storefront<{ cartLinesUpdate: CartPayload }>(UPDATE, { cartId, lines: [{ id: lineId, quantity }] }))
          .cartLinesUpdate)
      : unwrap((await storefront<{ cartLinesRemove: CartPayload }>(REMOVE, { cartId, lineIds: [lineId] })).cartLinesRemove);
  await remember(cart);
  return cart;
}

/** The visitor's cart with its lines, or null if they have none (or it expired). */
export async function getCart(locale: Locale): Promise<FullCart | null> {
  if (!isShopifyConfigured()) return null;
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) return null;

  const data = await storefront<{ cart: (Omit<FullCart, "lines"> & { lines: { nodes: CartLine[] } }) | null }>(
    `query Cart($cartId: ID!) @inContext(language: ${locale.toUpperCase()}) {
      cart(id: $cartId) {
        id checkoutUrl totalQuantity
        cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
        lines(first: 100) {
          nodes {
            id quantity
            attributes { key value }
            cost { totalAmount { amount currencyCode } }
            merchandise {
              ... on ProductVariant {
                id title
                image { url altText width height }
                selectedOptions { name value }
                product { handle title tags }
              }
            }
          }
        }
      }
    }`,
    { cartId },
  );
  if (!data.cart) return null;
  return { ...data.cart, lines: data.cart.lines.nodes };
}
