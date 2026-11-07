"use server";

import type { AddToBagResult } from "@/app/design/actions";
import { addToCart } from "@/lib/shopify/cart";
import { isShopifyConfigured } from "@/lib/shopify/storefront";

const VARIANT_ID = /^gid:\/\/shopify\/ProductVariant\/\d+$/;

/** Add one of a collection piece's variants to the Shopify cart. */
export async function addVariantToBag(variantId: unknown): Promise<AddToBagResult> {
  if (typeof variantId !== "string" || !VARIANT_ID.test(variantId)) return { status: "invalid" };
  if (!isShopifyConfigured()) return { status: "not-configured" };

  try {
    const cart = await addToCart([{ merchandiseId: variantId, quantity: 1 }]);
    return { status: "added", checkoutUrl: cart.checkoutUrl };
  } catch (error) {
    console.error("Adding collection piece to cart failed", error);
    return { status: "error" };
  }
}
