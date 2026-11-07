import "server-only";

import { sql } from "@payloadcms/db-postgres";
import type { BasePayload } from "payload";
import type Stripe from "stripe";
import { emptyCartByToken } from "@/lib/cart";
import { payloadClient } from "@/lib/payload";
import { sendOrderEmails } from "./notify";

/** What a completed Checkout Session tells us about the customer and the payment. */
export function paidDetails(session: Stripe.Checkout.Session) {
  const customer = session.customer_details;
  const shipping = session.collected_information?.shipping_details;
  const a = shipping?.address ?? customer?.address ?? null;
  return {
    customerName: shipping?.name || customer?.name || null,
    customerEmail: customer?.email || session.customer_email || null,
    customerPhone: customer?.phone || null,
    shippingAddress: {
      line1: a?.line1 ?? null,
      line2: a?.line2 ?? null,
      city: a?.city ?? null,
      state: a?.state ?? null,
      postalCode: a?.postal_code ?? null,
      country: a?.country ?? null,
    },
    presentmentAmount: session.presentment_details?.presentment_amount ?? session.amount_total ?? null,
    presentmentCurrency: session.presentment_details?.presentment_currency ?? session.currency ?? null,
    stripePaymentIntentId:
      typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null),
  };
}

/**
 * Move an order from "awaiting payment" to "paid" in one database statement,
 * so two deliveries of the same Stripe event can never both win. Returns true
 * only for the delivery that made the change.
 */
async function claimPaid(payload: BasePayload, orderId: number): Promise<boolean> {
  const db = (payload.db as unknown as { drizzle: { execute: (q: unknown) => Promise<{ rows: unknown[] }> } }).drizzle;
  const result = await db.execute(
    sql`UPDATE "orders" SET "status" = 'paid', "paid_at" = now(), "updated_at" = now() WHERE "id" = ${orderId} AND "status" = 'pending_payment' RETURNING "id"`,
  );
  return result.rows.length === 1;
}

export type PaidOutcome = "paid" | "already-handled" | "unknown-order" | "not-paid";

/**
 * Handle a completed (or late-succeeding) Checkout Session: mark its order
 * paid, record the customer's details, empty their bag and send the emails.
 * Safe to call any number of times for the same session.
 */
export async function handlePaidSession(session: Stripe.Checkout.Session): Promise<PaidOutcome> {
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") return "not-paid";
  const payload = await payloadClient();

  const fromMetadata = Number(session.metadata?.orderId);
  let orderId = Number.isInteger(fromMetadata) && fromMetadata > 0 ? fromMetadata : null;
  if (!orderId) {
    const { docs } = await payload.find({
      collection: "orders",
      where: { stripeCheckoutSessionId: { equals: session.id } },
      limit: 1,
      depth: 0,
    });
    orderId = docs[0]?.id ?? null;
  }
  if (!orderId) return "unknown-order";

  const order = await payload.findByID({ collection: "orders", id: orderId, depth: 0, disableErrors: true });
  if (!order) return "unknown-order";
  if (order.stripeCheckoutSessionId && order.stripeCheckoutSessionId !== session.id) return "unknown-order";

  if (!(await claimPaid(payload, orderId))) return "already-handled";

  await payload.update({
    collection: "orders",
    id: orderId,
    data: { ...paidDetails(session), stripeCheckoutSessionId: session.id },
  });
  if (order.cartToken) await emptyCartByToken(order.cartToken).catch((error) => payload.logger.error(error));
  await sendOrderEmails(orderId, "missing");
  return "paid";
}

/** An abandoned checkout: remove its order, which never became one. */
export async function handleExpiredSession(session: Stripe.Checkout.Session) {
  const payload = await payloadClient();
  await payload.delete({
    collection: "orders",
    where: { and: [{ stripeCheckoutSessionId: { equals: session.id } }, { status: { equals: "pending_payment" } }] },
  });
}
