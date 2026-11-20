import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/account";
import { adoptBag } from "@/lib/cart";
import { getCustomer } from "@/lib/customers";
import { siteUrl } from "@/lib/stripe";

// Every sign-in (email code or Google) passes through here: this device's bag
// joins the account's, then she goes back to where she was. A failed merge is
// logged and never blocks the sign-in.
// Redirects are built on the site's public address: behind nginx and Docker,
// request.url is the container's own (https://0.0.0.0:3000).
export async function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const customer = await getCustomer().catch((error) => {
    console.error("Loading the customer after sign-in failed", error);
    return null;
  });
  if (!customer) {
    return NextResponse.redirect(new URL(`/account/sign-in?next=${encodeURIComponent(next)}`, siteUrl()));
  }
  try {
    await adoptBag(customer.id);
  } catch (error) {
    console.error("Joining the bag to the account failed", error);
  }
  return NextResponse.redirect(new URL(next, siteUrl()));
}
