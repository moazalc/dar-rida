import type Stripe from "stripe";
import { handleExpiredSession, handlePaidSession } from "@/lib/orders/paid";
import { stripeClient } from "@/lib/stripe";

/**
 * Stripe's webhook: the only place an order becomes paid. The signature is
 * checked against the raw body, and handling is idempotent, so Stripe may
 * deliver an event as many times as it likes.
 */
export async function POST(request: Request) {
  const stripe = stripeClient();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return Response.json({ error: "Webhook not configured" }, { status: 500 });

  const signature = request.headers.get("stripe-signature");
  if (!signature) return Response.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(await request.text(), signature, secret);
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const outcome = await handlePaidSession(event.data.object);
        // A payment with no order to attach it to must never pass silently:
        // fail, so it shows in Stripe's dashboard and is retried.
        if (outcome === "unknown-order") {
          console.error(`Paid Checkout Session ${event.data.object.id} has no matching order`);
          return Response.json({ error: "No matching order" }, { status: 500 });
        }
        break;
      }
      case "checkout.session.expired":
        await handleExpiredSession(event.data.object);
        break;
    }
  } catch (error) {
    // A database failure: answer with an error so Stripe tries again later.
    console.error(`Handling Stripe event ${event.id} failed`, error);
    return Response.json({ error: "Handler failed" }, { status: 500 });
  }

  return Response.json({ received: true });
}
