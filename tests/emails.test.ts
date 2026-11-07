import { describe, expect, it } from "vitest";
import type { Order } from "@/cms/payload-types";
import { parseConfig } from "@/lib/configurator/options";
import { describeConfig } from "@/lib/configurator/describe";
import ar from "@/lib/i18n/dictionaries/ar";
import en from "@/lib/i18n/dictionaries/en";
import { customerEmail, ownerEmail } from "@/lib/orders/emails";

const measurements = { length: 56, bust: 36, shoulder: 15.5, sleeve: 23, hips: 40, height: 165 };

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
    expect(text).toContain("Shoulder: 15.5 in");
    expect(text).toContain("Height: 165 cm");
    expect(text).toContain("Notes: <b>longer</b>");
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
