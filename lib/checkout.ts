import "server-only";

import { cookies } from "next/headers";
import type Stripe from "stripe";
import type { Customer } from "@/cms/payload-types";
import { ADDRESS_COOKIE, pickAddress } from "@/lib/account";
import { findCart, priceCart, type Bag } from "@/lib/cart";
import { getCustomer } from "@/lib/customers";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionaries";
import { handlePaidSession } from "@/lib/orders/paid";
import { snapshotLine, type OrderLine } from "@/lib/orders/snapshot";
import { payloadClient } from "@/lib/payload";
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
    const customer = await getCustomer().catch((error) => {
      console.error("Reading the customer at checkout failed", error);
      return null;
    });

    // One open checkout per bag: close the previous one before starting another.
    const previousId = typeof cart.pendingOrder === "object" ? cart.pendingOrder?.id : cart.pendingOrder;
    if (previousId) {
      const previous = await payload.findByID({ collection: "orders", id: previousId, depth: 0, disableErrors: true });
      if (previous?.status === "pending_payment") {
        if (previous.stripeCheckoutSessionId) {
          const closed = await closeSession(stripe, previous.stripeCheckoutSessionId);
          if (closed === "paid") return { status: "not-ready" }; // it was paid after all; the bag is now empty
          if (closed === "open") return { status: "error" };
        }
        await payload.delete({
          collection: "orders",
          where: { and: [{ id: { equals: previous.id } }, { status: { equals: "pending_payment" } }] },
        });
      }
    }

    const lines = bag.lines.map((l) => snapshotLine(l, en));
    const order = await payload.create({
      collection: "orders",
      data: {
        status: "pending_payment",
        lines,
        market: bag.market.id,
        currency: bag.currency,
        shippingCountry: bag.country,
        subtotal: bag.subtotal,
        shipping: bag.shipping!.fee,
        shippingZone: bag.shipping!.zone,
        total: bag.total,
        // Order emails exist in English and Arabic only; the other languages get English until they are translated.
        locale: locale === "ar" ? "ar" : "en",
        cartToken: cart.token,
        customer: customer?.id,
      },
    });

    let session: Stripe.Checkout.Session;
    try {
      const stripeCustomer = customer ? await stripeCustomerFor(stripe, customer, bag.country) : null;
      session = await createSession(stripe, order, lines, bag, locale, dict, stripeCustomer);
    } catch (error) {
      // Never leave an order behind that has no way to be paid or expire.
      await payload.delete({ collection: "orders", id: order.id }).catch(() => undefined);
      throw error;
    }

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

/**
 * Close a bag's earlier Checkout Session before starting a new one. If it
 * can't be closed because the customer already paid (and Stripe's webhook has
 * not landed yet), record the payment now instead of discarding the order.
 */
async function closeSession(stripe: Stripe, sessionId: string): Promise<"closed" | "paid" | "open"> {
  try {
    await stripe.checkout.sessions.expire(sessionId);
    return "closed";
  } catch {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.status === "expired") return "closed";
    if (session.status === "complete" && session.payment_status !== "unpaid") {
      await handlePaidSession(session);
      return "paid";
    }
    // Complete but still unpaid (a delayed payment method) or still open: leave it alone.
    return "open";
  }
}

async function createSession(
  stripe: Stripe,
  order: { id: number; number?: string | null },
  lines: OrderLine[],
  bag: Bag,
  locale: Locale,
  dict: Dictionary,
  stripeCustomer: string | null,
): Promise<Stripe.Checkout.Session> {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = lines.map((l) => ({
    quantity: l.quantity,
    price_data: {
      currency: bag.currency,
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
      // Only the country the bag was priced for, so a market's prices can't ship elsewhere.
      shipping_address_collection: { allowed_countries: [bag.country!] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: bag.shipping!.fee, currency: bag.currency },
            display_name: bag.shipping!.free ? dict.cart.shippingFree : dict.cart.shipping,
          },
        },
      ],
      phone_number_collection: { enabled: true },
      // Signed in: Stripe starts with her saved name, phone and address, and
      // saves back anything she changes.
      ...(stripeCustomer
        ? { customer: stripeCustomer, customer_update: { name: "auto" as const, shipping: "auto" as const } }
        : {}),
      // Dollar prices are shown in the customer's own currency; dirham prices are already local.
      adaptive_pricing: { enabled: bag.currency === "usd" },
      // Stripe Checkout has no Arabic; "auto" follows the browser, falling back to English.
      locale: locale === "ar" ? "auto" : "en",
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 2,
      success_url: `${siteUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/cart`,
    },
    { idempotencyKey: `order-${order.id}` },
  );
  return session;
}

/**
 * Her Stripe customer, made on her first checkout, with the saved address for
 * this country (the one chosen in the bag, else the default) as its shipping
 * address, so Checkout opens with it filled in. A stored ID that Stripe no
 * longer knows (test and live keys differ) is replaced.
 */
async function stripeCustomerFor(stripe: Stripe, customer: Customer, country: string | null): Promise<string> {
  const chosen = (await cookies()).get(ADDRESS_COOKIE)?.value;
  const address = pickAddress(customer.addresses ?? [], country, chosen);
  const details: Stripe.CustomerUpdateParams = {
    email: customer.email,
    ...(customer.name && { name: customer.name }),
    ...(customer.phone && { phone: customer.phone }),
    ...(address && {
      shipping: {
        name: address.name,
        phone: address.phone || customer.phone || undefined,
        address: {
          line1: address.line1,
          line2: address.line2 || undefined,
          city: address.city,
          state: address.state || undefined,
          postal_code: address.postalCode || undefined,
          country: address.country,
        },
      },
    }),
  };

  if (customer.stripeCustomerId) {
    try {
      await stripe.customers.update(customer.stripeCustomerId, details);
      return customer.stripeCustomerId;
    } catch (error) {
      if ((error as { code?: string }).code !== "resource_missing") throw error;
    }
  }
  const created = await stripe.customers.create({ ...(details as Stripe.CustomerCreateParams), metadata: { customerId: String(customer.id) } });
  const payload = await payloadClient();
  await payload.update({ collection: "customers", id: customer.id, data: { stripeCustomerId: created.id }, depth: 0 });
  return created.id;
}
