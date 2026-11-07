"use server";

import en from "@/lib/i18n/dictionaries/en";
import {
  isOption,
  isSizingComplete,
  measurements,
  NOTES_MAX,
  options,
  sizingFields,
  type ChoiceStep,
  type Measurement,
  type Sizing,
} from "@/lib/configurator/options";
import { addToCart } from "@/lib/shopify/cart";
import { isShopifyConfigured } from "@/lib/shopify/storefront";

/** Property names on the Shopify order line. */
const attributeKeys: Record<ChoiceStep, string> = {
  cut: "Cut",
  sleeve: "Sleeve",
  fabric: "Fabric",
  colour: "Colour",
  finishing: "Finishing",
};

export type AddToBagResult =
  | { status: "added"; checkoutUrl: string }
  | { status: "not-configured" }
  | { status: "invalid" }
  | { status: "error" };

/**
 * Add a custom abaya to the Shopify cart. Every design is one line of the
 * single "Custom Abaya" product variant; the choices travel as line item
 * properties, written in English for the workshop whatever the shopper's
 * language. Inputs are re-checked here because Server Actions are public.
 */
export async function addCustomAbayaToBag(input: {
  config: Record<string, unknown>;
  sizing: Sizing;
  notes: unknown;
}): Promise<AddToBagResult> {
  const choiceSteps = Object.keys(options) as ChoiceStep[];
  if (!choiceSteps.every((step) => isOption(step, input.config?.[step]))) return { status: "invalid" };
  const sizing = input.sizing;
  if (typeof sizing !== "object" || sizing === null || !isSizingComplete(sizing)) return { status: "invalid" };
  const notes = typeof input.notes === "string" ? input.notes.trim().slice(0, NOTES_MAX) : "";

  const variantId = process.env.SHOPIFY_CUSTOM_ABAYA_VARIANT_ID;
  if (!isShopifyConfigured() || !variantId) return { status: "not-configured" };

  const attributes = choiceSteps.map((step) => {
    const value = input.config[step] as string;
    const label = (en.design.options[step] as Record<string, { name: string }>)[value].name;
    return { key: attributeKeys[step], value: label };
  });
  if (sizing.mode === "standard") attributes.push({ key: "Size", value: sizing.size });
  for (const m of sizingFields[sizing.mode] as readonly Measurement[]) {
    attributes.push({ key: en.design.sizing.fields[m].label, value: `${sizing[m]} ${measurements[m].unit}` });
  }
  if (notes) attributes.push({ key: "Notes", value: notes });

  try {
    const cart = await addToCart([{ merchandiseId: variantId, quantity: 1, attributes }]);
    return { status: "added", checkoutUrl: cart.checkoutUrl };
  } catch (error) {
    console.error("Adding custom abaya to cart failed", error);
    return { status: "error" };
  }
}
