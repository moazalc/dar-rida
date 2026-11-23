import { describe, expect, it } from "vitest";
import { localePath, switchLocalePath } from "@/lib/i18n/config";
import { checkoutReturnUrls } from "@/lib/checkout-urls";

describe("localePath", () => {
  it("prefixes internal paths", () => {
    expect(localePath("ar", "/collection")).toBe("/ar/collection");
    expect(localePath("ar", "/")).toBe("/ar");
    expect(localePath("en", "/search?q=a#r")).toBe("/en/search?q=a#r");
  });

  it("localePath is idempotent and ignores external urls", () => {
    expect(localePath("ar", "/ar/cart")).toBe("/ar/cart");
    expect(localePath("ar", "/en/cart")).toBe("/en/cart");
    for (const href of ["https://x.com/a", "mailto:a@b.c", "tel:+971", "#top", "cart", "//evil.com/x", "/api/x", "/media/a.jpg", "/atelier", "/print/orders/1"]) {
      expect(localePath("ar", href), href).toBe(href);
    }
  });
});

describe("switchLocalePath", () => {
  it("swaps or adds the prefix", () => {
    expect(switchLocalePath("/ar/cart", "en")).toBe("/en/cart");
    expect(switchLocalePath("/cart", "fr")).toBe("/fr/cart");
    expect(switchLocalePath("/ar", "en")).toBe("/en");
    expect(switchLocalePath("/ar/", "en")).toBe("/en");
  });
});

describe("checkout urls carry the locale", () => {
  it("builds Stripe return addresses in the buyer's language", () => {
    expect(checkoutReturnUrls("https://darrida.net", "ar")).toEqual({
      success_url: "https://darrida.net/ar/checkout/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://darrida.net/ar/cart",
    });
  });
});
