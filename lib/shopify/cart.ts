import "server-only";

import { cookies } from "next/headers";
import { ShopifyError, storefront } from "./storefront";

/** Cookie holding the visitor's Shopify cart id. */
const CART_COOKIE = "darrida_cart";

export type CartLineInput = {
  merchandiseId: string;
  quantity: number;
  /** Line item properties, shown on the order in Shopify admin. */
  attributes?: { key: string; value: string }[];
};

export type Cart = { id: string; checkoutUrl: string; totalQuantity: number };

type CartPayload = { cart: Cart | null; userErrors: { message: string }[] };

const CART_FIELDS = "cart { id checkoutUrl totalQuantity } userErrors { message }";

const CREATE = `mutation cartCreate($lines: [CartLineInput!]!) {
  cartCreate(input: { lines: $lines }) { ${CART_FIELDS} }
}`;

const ADD = `mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) { ${CART_FIELDS} }
}`;

function unwrap(payload: CartPayload): Cart {
  if (payload.userErrors.length) throw new ShopifyError(payload.userErrors.map((e) => e.message).join("; "));
  if (!payload.cart) throw new ShopifyError("No cart returned");
  return payload.cart;
}

/**
 * Add lines to the visitor's cart, creating one if they have none (or theirs
 * has expired on Shopify's side), and remember its id in a cookie.
 */
export async function addToCart(lines: CartLineInput[]): Promise<Cart> {
  const store = await cookies();
  const cartId = store.get(CART_COOKIE)?.value;

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

  store.set(CART_COOKIE, cart.id, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 14, // Shopify keeps idle carts for about 10 days.
  });
  return cart;
}
