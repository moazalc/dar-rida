/**
 * How an order moves from paid to delivered, and the dates and links that go
 * with each step. Pure: no database, so the rules are easy to test and the
 * admin, the server and the customer's account all read them the same way.
 *
 *   paid ("New") → in_production → shipped → completed ("Delivered")
 *   cancelled is allowed only before shipping.
 */

export type FulfilmentStatus = "pending_payment" | "paid" | "in_production" | "shipped" | "completed" | "cancelled";
export type OrderAction = "start" | "ship" | "deliver" | "cancel";

const MOVES: Record<OrderAction, { from: FulfilmentStatus[]; to: FulfilmentStatus }> = {
  start: { from: ["paid"], to: "in_production" },
  ship: { from: ["in_production"], to: "shipped" },
  deliver: { from: ["shipped"], to: "completed" },
  cancel: { from: ["paid", "in_production"], to: "cancelled" },
};

export const ORDER_ACTIONS = Object.keys(MOVES) as OrderAction[];

export const isOrderAction = (value: unknown): value is OrderAction => typeof value === "string" && value in MOVES;

/** The status an action leads to, or null when it isn't allowed from this status. */
export function nextStatus(status: string | null | undefined, action: OrderAction): FulfilmentStatus | null {
  const move = MOVES[action];
  return move.from.includes(status as FulfilmentStatus) ? move.to : null;
}

/** The buttons an order shows, main step first. */
export function availableActions(status: string | null | undefined): OrderAction[] {
  return ORDER_ACTIONS.filter((a) => nextStatus(status, a) !== null);
}

// --- Couriers ----------------------------------------------------------------

export const CARRIERS = {
  aramex: { name: "Aramex", url: "https://www.aramex.com/track/results?ShipmentNumber={n}" },
  dhl: { name: "DHL Express", url: "https://www.dhl.com/global-en/home/tracking/tracking-express.html?submit=1&tracking-id={n}" },
  fedex: { name: "FedEx", url: "https://www.fedex.com/fedextrack/?trknbr={n}" },
  ups: { name: "UPS", url: "https://www.ups.com/track?tracknum={n}" },
  // Emirates Post has no stable deep link, so its numbers open in 17TRACK, which follows it.
  emirates_post: { name: "Emirates Post", url: "https://t.17track.net/en#nums={n}" },
  other: { name: "Other", url: null },
} as const;

export type Carrier = keyof typeof CARRIERS;

export const isCarrier = (value: unknown): value is Carrier => typeof value === "string" && value in CARRIERS;

export const carrierOptions = (Object.keys(CARRIERS) as Carrier[]).map((value) => ({ label: CARRIERS[value].name, value }));

/** Tracking numbers are letters, digits, spaces and dashes; anything else is refused. */
export function cleanTrackingNumber(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const n = value.trim().replace(/\s+/g, " ");
  return /^[A-Za-z0-9][A-Za-z0-9 -]{3,39}$/.test(n) ? n : null;
}

function cleanLink(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export type ShipInput = { carrier?: unknown; trackingNumber?: unknown; trackingUrl?: unknown };
export type Shipment = { carrier: Carrier; trackingNumber: string; trackingUrl: string };

/**
 * The courier, number and tracking link for "Mark as shipped". Known couriers
 * get their link built from the number; "Other" needs an https link pasted in.
 */
export function parseShipment(input: ShipInput): { ok: true; shipment: Shipment } | { ok: false; field: "carrier" | "trackingNumber" | "trackingUrl" } {
  if (!isCarrier(input.carrier)) return { ok: false, field: "carrier" };
  const trackingNumber = cleanTrackingNumber(input.trackingNumber);
  if (!trackingNumber) return { ok: false, field: "trackingNumber" };
  const template = CARRIERS[input.carrier].url;
  const trackingUrl = template
    ? template.replace("{n}", encodeURIComponent(trackingNumber.replace(/ /g, "")))
    : cleanLink(input.trackingUrl);
  if (!trackingUrl) return { ok: false, field: "trackingUrl" };
  return { ok: true, shipment: { carrier: input.carrier, trackingNumber, trackingUrl } };
}

// --- Dates -------------------------------------------------------------------

const DAY = 86_400_000;

export const addDays = (from: Date, days: number) => new Date(from.getTime() + days * DAY);

/** Used until the owners set a store-wide default making time. */
export const DEFAULT_MAKING_DAYS = 14;

const positive = (n: unknown): number | null => (typeof n === "number" && Number.isFinite(n) && n > 0 ? Math.round(n) : null);

/**
 * How long an order takes to make: its slowest piece. A piece without its own
 * making time (or a custom abaya) uses the store's default.
 */
export function makingDays(pieces: (number | null | undefined)[], fallback: number): number {
  const base = positive(fallback) ?? DEFAULT_MAKING_DAYS;
  return pieces.length ? Math.max(...pieces.map((d) => positive(d) ?? base)) : base;
}

export type DeliverySettings = {
  uae?: { deliveryDays?: number | null } | null;
  zones?: { countries?: string[] | null; deliveryDays?: number | null }[] | null;
  restOfWorld?: { deliveryDays?: number | null } | null;
};

/** Usual courier days to a country, from the Shipping settings (same zones as the fees). Null when not set. */
export function deliveryDays(country: string | null | undefined, settings: DeliverySettings): number | null {
  if (!country) return positive(settings.restOfWorld?.deliveryDays);
  if (country === "AE") return positive(settings.uae?.deliveryDays);
  const zone = settings.zones?.find((z) => z.countries?.includes(country));
  return positive(zone ? zone.deliveryDays : settings.restOfWorld?.deliveryDays);
}

/** Days after the expected delivery before the dashboard suggests checking on a parcel. */
export const CHECK_ON_GRACE_DAYS = 3;

export type FlagOrder = { status?: string | null; readyBy?: string | null; expectedDelivery?: string | null };

/** Late: still being made after its ready-by date. Check on: shipped and well past its expected delivery. */
export function orderFlags(order: FlagOrder, now = new Date()): { late: boolean; checkOn: boolean } {
  const late = order.status === "in_production" && Boolean(order.readyBy) && new Date(order.readyBy!).getTime() < now.getTime();
  const checkOn =
    order.status === "shipped" &&
    Boolean(order.expectedDelivery) &&
    addDays(new Date(order.expectedDelivery!), CHECK_ON_GRACE_DAYS).getTime() < now.getTime();
  return { late, checkOn };
}
