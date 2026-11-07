import "server-only";

import type Stripe from "stripe";
import { findCart, priceCart } from "@/lib/cart";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { snapshotLine } from "@/lib/orders/snapshot";
import { payloadClient } from "@/lib/payload";
import { shippingCountries } from "@/lib/shipping-countries";
import { siteUrl, stripeClient } from "@/lib/stripe";

export type CheckoutResult = { status: "redirect"; url: string } | { status: "not-ready" } | { status: "error" };

/**
 * Turn the visitor's bag into an order awaiting payment and a Stripe Checkout
 * Session for it. Every price is worked out again here from the database. The
 * order only becomes "paid" when Stripe's webhook says so.
 */
export async function startCheckout(locale: Locale): Promise<CheckoutResult> {
  const stripe = stripeClient();
  if (!stripe) {
    console.error("Checkout is not set up: STRIPE_SECRET_KEY is missing");
    return { status: "error" };
  }

  try {
    const cart = await findCart();
    if (!cart) return { status: "not-ready" };
    const [dict, en] = await Promise.all([getDictionary(locale), getDictionary("en")]);
    const bag = await priceCart(cart, locale, dict, en);
    if (!bag.ready) return { status: "not-ready" };

    const payload = await payloadClient();

    // One open checkout per bag: close the previous one before starting another.
    const previousId = typeof cart.pendingOrder === "object" ? cart.pendingOrder?.id : cart.pendingOrder;
    if (previousId) {
      const previous = await payload.findByID({ collection: "orders", id: previousId, depth: 0, disableErrors: true });
      if (previous?.status === "pending_payment") {
        if (previous.stripeCheckoutSessionId) {
          await stripe.checkout.sessions.expire(previous.stripeCheckoutSessionId).catch(() => undefined);
        }
        await payload.delete({ collection: "orders", id: previous.id });
      }
    }

    const lines = bag.lines.map((l) => snapshotLine(l, en));
    const order = await payload.create({
      collection: "orders",
      data: {
        status: "pending_payment",
        lines,
        subtotal: bag.subtotal,
        total: bag.subtotal,
        currency: "usd",
        locale,
        cartToken: cart.token,
      },
    });

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = lines.map((l) => ({
      quantity: l.quantity,
      price_data: {
        currency: "usd",
        unit_amount: l.unitPrice,
        product_data: {
          name: locale === "ar" && l.nameAr ? l.nameAr : l.kind === "custom" ? dict.cart.customName : l.name,
          description: dict.checkout.madeToMeasure,
        },
      },
    }));

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        line_items: lineItems,
        client_reference_id: String(order.id),
        metadata: { orderId: String(order.id), orderNumber: order.number ?? "" },
        payment_intent_data: { metadata: { orderId: String(order.id), orderNumber: order.number ?? "" } },
        shipping_address_collection: { allowed_countries: [...shippingCountries] },
        phone_number_collection: { enabled: true },
        adaptive_pricing: { enabled: true },
        locale: locale === "ar" ? "ar" : "en",
        expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 2,
        success_url: `${siteUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl()}/cart`,
      },
      { idempotencyKey: `order-${order.id}` },
    );

    await Promise.all([
      payload.update({ collection: "orders", id: order.id, data: { stripeCheckoutSessionId: session.id } }),
      payload.update({ collection: "carts", id: cart.id, data: { pendingOrder: order.id } }),
    ]);

    if (!session.url) throw new Error("Stripe returned no checkout URL");
    return { status: "redirect", url: session.url };
  } catch (error) {
    console.error("Starting checkout failed", error);
    return { status: "error" };
  }
}
