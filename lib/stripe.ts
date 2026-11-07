import "server-only";

import Stripe from "stripe";

let client: Stripe | null = null;

/** The Stripe client, or null while no secret key is set (e.g. before the account exists). */
export function stripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  client ??= new Stripe(key);
  return client;
}

/** The site's public address, for Stripe's return links. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}
