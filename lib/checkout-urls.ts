import { localePath, type Locale } from "@/lib/i18n/config";

/** Where Stripe sends her back after paying or cancelling, in the language she shopped in. */
export function checkoutReturnUrls(base: string, locale: Locale): { success_url: string; cancel_url: string } {
  return {
    success_url: `${base}${localePath(locale, "/checkout/success")}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}${localePath(locale, "/cart")}`,
  };
}
