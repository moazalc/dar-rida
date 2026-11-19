import { describe, expect, it } from "vitest";
import type { Order } from "@/cms/payload-types";
import { parseConfig } from "@/lib/configurator/options";
import { describeConfig } from "@/lib/configurator/describe";
import ar from "@/lib/i18n/dictionaries/ar";
import en from "@/lib/i18n/dictionaries/en";
import { customerEmail, ownerEmail } from "@/lib/orders/emails";

// An order from before units: lengths in inches, height in centimetres.
const measurements = { unit: "legacy", length: 56, bust: 36, shoulder: 15.5, sleeve: 23, hips: 40, height: 165 };
const metric = { unit: "cm", height: 165, length: 142, shoulder: 39, bust: 91, sleeve: 58, hips: 102 };

const order = {
  id: 7,
  number: "DR-1007",
  status: "paid",
  locale: "en",
  subtotal: 75000,
  total: 75000,
  customerName: "Mariam <script>",
  customerEmail: "m@example.test",
  shippingAddress: { line1: "1 Street", city: "Dubai", country: "AE" },
  lines: [
    { kind: "design", name: "RIDA 01 · The Cascade", nameAr: "RIDA 01 · الشلال", quantity: 1, unitPrice: 40000, measurements, notes: "<b>longer</b>" },
    { kind: "custom", name: "Custom abaya", quantity: 1, unitPrice: 35000, measurements, config: { cut: "wrap", sleeve: "bell", fabric: "silk", colour: "navy", finishing: "crystals" }, choices: [{ label: "Cut", value: "Wrap" }] },
  ],
  createdAt: "",
  updatedAt: "",
} as unknown as Order;

describe("order emails", () => {
  it("escapes customer-written text", () => {
    const { html } = customerEmail(order, en, null);
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<b>longer</b>");
    expect(html).toContain("&lt;b&gt;longer&lt;/b&gt;");
  });

  it("lists every measurement for the workshop, with the number in the subject", () => {
    const { subject, text } = ownerEmail(order, "https://example.test/admin/collections/orders/7");
    expect(subject).toBe("New order DR-1007 — 2 pieces — $750");
    expect(text).toContain("Shoulder width: 15.5 in (≈ 39.4 cm)");
    expect(text).toContain("Height: 165 cm (≈ 5′5″)");
    expect(text).toContain("Notes: <b>longer</b>");
  });

  it("gives the workshop centimetre orders exactly as entered, with inches for reference only", () => {
    const cmOrder = { ...order, lines: [{ ...order.lines![0], measurements: metric }] } as Order;
    const { text } = ownerEmail(cmOrder, "https://example.test/admin");
    expect(text).toContain("Bust: 91 cm (≈ 35.8 in)");
    expect(text).toContain("Shoulder width: 39 cm (≈ 15.4 in)");
  });

  it("shows the customer their own numbers in their own unit", () => {
    const cmOrder = { ...order, lines: [{ ...order.lines![0], measurements: metric }] } as Order;
    const { text } = customerEmail(cmOrder, en, null);
    expect(text).toContain("Bust 91 cm");
    expect(text).not.toContain("≈");
  });

  it("bills UAE orders in dirhams with the shipping line, and tells the workshop the market", () => {
    const aed = { ...order, market: "uae", currency: "aed", subtotal: 150000, shipping: 2500, shippingZone: "UAE", total: 152500, shippingCountry: "AE", lines: [{ ...order.lines![0], unitPrice: 150000 }] } as Order;
    const customer = customerEmail(aed, en, null).text;
    expect(customer).toContain("Shipping: AED 25");
    expect(customer).toContain("Total: AED 1,525");
    expect(customer).not.toContain("Charged as");
    const owner = ownerEmail(aed, "https://example.test/admin");
    expect(owner.subject).toBe("New order DR-1007 — 1 piece — AED 1,525");
    expect(owner.text).toContain("UAE prices (AED) · Shipping (UAE): AED 25");
    expect(owner.text).toContain("(AED 1,500 each)");
  });

  it("writes to Arabic customers in Arabic, right to left", () => {
    const email = customerEmail({ ...order, locale: "ar" }, ar, null);
    expect(email.subject).toContain("DR-1007");
    expect(email.html).toContain('dir="rtl"');
    expect(email.html).toContain("الشلال");
    expect(email.text).toContain(ar.design.options.fabric.silk.name);
  });
});

describe("builder config", () => {
  it("rejects choices that are not on offer", () => {
    expect(parseConfig({ cut: "wrap", sleeve: "bell", fabric: "silk", colour: "navy", finishing: "gold-plated" })).toBeNull();
  });

  it("names the choices in the given language", () => {
    const rows = describeConfig({ cut: "wrap", sleeve: "bell", fabric: "silk", colour: "navy", finishing: "crystals" }, en);
    expect(rows[0]).toEqual({ label: en.design.steps.cut.short, value: en.design.options.cut.wrap.name });
  });
});
