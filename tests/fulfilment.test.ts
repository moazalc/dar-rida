import { describe, expect, it } from "vitest";
import type { Order } from "@/cms/payload-types";
import {
  addDays,
  availableActions,
  deliveryDays,
  makingDays,
  nextStatus,
  orderFlags,
  parseShipment,
} from "@/lib/orders/fulfilment";
import { shippedEmail } from "@/lib/orders/emails";
import ar from "@/lib/i18n/dictionaries/ar";
import en from "@/lib/i18n/dictionaries/en";

describe("order steps", () => {
  it("moves one step at a time", () => {
    expect(nextStatus("paid", "start")).toBe("in_production");
    expect(nextStatus("in_production", "ship")).toBe("shipped");
    expect(nextStatus("shipped", "deliver")).toBe("completed");
  });

  it("never skips a step or goes back", () => {
    expect(nextStatus("paid", "ship")).toBeNull();
    expect(nextStatus("paid", "deliver")).toBeNull();
    expect(nextStatus("completed", "start")).toBeNull();
    expect(nextStatus("pending_payment", "start")).toBeNull();
  });

  it("cancels only before shipping", () => {
    expect(nextStatus("paid", "cancel")).toBe("cancelled");
    expect(nextStatus("in_production", "cancel")).toBe("cancelled");
    expect(nextStatus("shipped", "cancel")).toBeNull();
  });

  it("offers the next step first", () => {
    expect(availableActions("paid")).toEqual(["start", "cancel"]);
    expect(availableActions("in_production")).toEqual(["ship", "cancel"]);
    expect(availableActions("shipped")).toEqual(["deliver"]);
    expect(availableActions("completed")).toEqual([]);
    expect(availableActions("pending_payment")).toEqual([]);
  });
});

describe("parseShipment", () => {
  it("builds the courier's tracking link", () => {
    expect(parseShipment({ carrier: "dhl", trackingNumber: " 12 3456 7890 " })).toEqual({
      ok: true,
      shipment: {
        carrier: "dhl",
        trackingNumber: "12 3456 7890",
        trackingUrl: "https://www.dhl.com/global-en/home/tracking/tracking-express.html?submit=1&tracking-id=1234567890",
      },
    });
    const aramex = parseShipment({ carrier: "aramex", trackingNumber: "AB-1234" });
    expect(aramex.ok && aramex.shipment.trackingUrl).toBe("https://www.aramex.com/track/results?ShipmentNumber=AB-1234");
  });

  it("needs an https link for another courier", () => {
    expect(parseShipment({ carrier: "other", trackingNumber: "X12345", trackingUrl: "https://track.example.com/X12345" })).toMatchObject({
      ok: true,
      shipment: { trackingUrl: "https://track.example.com/X12345" },
    });
    expect(parseShipment({ carrier: "other", trackingNumber: "X12345", trackingUrl: "javascript:alert(1)" })).toEqual({ ok: false, field: "trackingUrl" });
    expect(parseShipment({ carrier: "other", trackingNumber: "X12345" })).toEqual({ ok: false, field: "trackingUrl" });
  });

  it("refuses unknown couriers and odd numbers", () => {
    expect(parseShipment({ carrier: "pigeon", trackingNumber: "12345" })).toEqual({ ok: false, field: "carrier" });
    expect(parseShipment({ carrier: "ups", trackingNumber: "12" })).toEqual({ ok: false, field: "trackingNumber" });
    expect(parseShipment({ carrier: "ups", trackingNumber: "1234<script>" })).toEqual({ ok: false, field: "trackingNumber" });
  });
});

describe("making and delivery days", () => {
  it("uses the slowest piece", () => {
    expect(makingDays([3, 10], 14)).toBe(10);
  });

  it("uses the store default for pieces without their own, and for an empty order", () => {
    expect(makingDays([3, null], 7)).toBe(7);
    expect(makingDays([], 7)).toBe(7);
    expect(makingDays([null], 0)).toBe(14);
  });

  const shipping = {
    uae: { deliveryDays: 2 },
    zones: [{ countries: ["FR", "DE"], deliveryDays: 5 }, { countries: ["US"], deliveryDays: null }],
    restOfWorld: { deliveryDays: 9 },
  };

  it("reads the usual delivery for the country's zone", () => {
    expect(deliveryDays("AE", shipping)).toBe(2);
    expect(deliveryDays("FR", shipping)).toBe(5);
    expect(deliveryDays("JP", shipping)).toBe(9);
  });

  it("is null when the zone has none set", () => {
    expect(deliveryDays("US", shipping)).toBeNull();
    expect(deliveryDays("AE", {})).toBeNull();
  });
});

describe("orderFlags", () => {
  const now = new Date("2026-11-19T12:00:00Z");

  it("flags an order still being made after its ready-by date", () => {
    expect(orderFlags({ status: "in_production", readyBy: "2026-11-18T00:00:00Z" }, now).late).toBe(true);
    expect(orderFlags({ status: "in_production", readyBy: "2026-11-20T00:00:00Z" }, now).late).toBe(false);
    expect(orderFlags({ status: "shipped", readyBy: "2026-11-18T00:00:00Z" }, now).late).toBe(false);
  });

  it("suggests checking on a parcel only well past its expected delivery", () => {
    const expected = (days: number) => addDays(now, -days).toISOString();
    expect(orderFlags({ status: "shipped", expectedDelivery: expected(2) }, now).checkOn).toBe(false);
    expect(orderFlags({ status: "shipped", expectedDelivery: expected(4) }, now).checkOn).toBe(true);
    expect(orderFlags({ status: "completed", expectedDelivery: expected(10) }, now).checkOn).toBe(false);
  });
});

describe("shippedEmail", () => {
  const order = {
    id: 1,
    number: "DR-1001",
    customerName: "Fatima Ali",
    locale: "en",
    carrier: "dhl",
    trackingNumber: "1234567890",
    trackingUrl: "https://www.dhl.com/track?id=1234567890&x=<y>",
    lines: [{ kind: "design", name: "Rida 01", nameAr: "رِدا ٠١", quantity: 1, unitPrice: 100, measurements: { unit: "cm" } }],
    shippingAddress: { line1: "Villa 12", city: "Dubai", country: "AE" },
  } as unknown as Order;

  it("names the courier and links to tracking, escaped", () => {
    const email = shippedEmail(order, en);
    expect(email.subject).toBe("Your Dar Rida order DR-1001 is on its way");
    expect(email.html).toContain("DHL Express");
    expect(email.html).toContain("&amp;x=&lt;y&gt;");
    expect(email.html).toContain("Good news, Fatima.");
    expect(email.text).toContain("Track your order: https://www.dhl.com/track?id=1234567890&x=<y>");
  });

  it("is right-to-left in Arabic, with the Arabic piece name", () => {
    const email = shippedEmail({ ...order, locale: "ar" } as Order, ar);
    expect(email.html).toContain('lang="ar" dir="rtl"');
    expect(email.html).toContain("رِدا ٠١");
  });
});
