import "server-only";

import type { Order } from "@/cms/payload-types";
import { cleanText } from "@/lib/account";
import { payloadClient } from "@/lib/payload";
import {
  addDays,
  deliveryDays,
  makingDays,
  nextStatus,
  parseShipment,
  type DeliverySettings,
  type OrderAction,
  type ShipInput,
} from "./fulfilment";
import { sendShippedEmail } from "./notify";

export type AdvanceInput = ShipInput & { reason?: unknown };

export type AdvanceResult =
  | { ok: true; status: string; emailed?: boolean }
  | { ok: false; error: "unknown-order" | "not-allowed" | "changed" | "invalid"; field?: string };

/**
 * Move an order one step on (start production, ship, deliver, cancel), stamp
 * the date and who did it, and send the shipped email. The update only applies
 * if the order is still in the status it was read in, so a double click or two
 * people at once can never send the email twice or skip a step.
 */
export async function advanceOrder(id: number, action: OrderAction, input: AdvanceInput, by: string): Promise<AdvanceResult> {
  const payload = await payloadClient();
  const order = (await payload.findByID({ collection: "orders", id, depth: 0, disableErrors: true })) as Order | null;
  if (!order) return { ok: false, error: "unknown-order" };
  const to = nextStatus(order.status, action);
  if (!to) return { ok: false, error: "not-allowed" };

  const now = new Date();
  const at = now.toISOString();
  const data: Partial<Order> = {
    status: to,
    history: [...(order.history ?? []).map(({ status, at, by }) => ({ status, at, by })), { status: to, at, by }],
  };

  if (action === "start") {
    const ids = (order.lines ?? []).flatMap((l) => (l.kind === "design" && typeof l.design === "number" ? [l.design] : []));
    const [designs, settings] = await Promise.all([
      ids.length
        ? payload.find({ collection: "designs", where: { id: { in: ids } }, limit: ids.length, depth: 0, select: { makingDays: true } })
        : Promise.resolve({ docs: [] as { id: number; makingDays?: number | null }[] }),
      payload.findGlobal({ slug: "store-settings", depth: 0 }),
    ]);
    const byId = new Map(designs.docs.map((d) => [d.id, d.makingDays ?? null]));
    const pieces = (order.lines ?? []).map((l) => (l.kind === "design" && typeof l.design === "number" ? byId.get(l.design) ?? null : null));
    data.productionStartedAt = at;
    data.readyBy = addDays(now, makingDays(pieces, settings.defaultMakingDays ?? 0)).toISOString();
  }

  if (action === "ship") {
    const parsed = parseShipment(input);
    if (!parsed.ok) return { ok: false, error: "invalid", field: parsed.field };
    const shipping = (await payload.findGlobal({ slug: "shipping", depth: 0 })) as DeliverySettings;
    const days = deliveryDays(order.shippingCountry ?? order.shippingAddress?.country, shipping);
    Object.assign(data, parsed.shipment, {
      shippedAt: at,
      expectedDelivery: days ? addDays(now, days).toISOString() : null,
    });
  }

  if (action === "deliver") data.deliveredAt = at;

  if (action === "cancel") {
    const reason = cleanText(input.reason, 500);
    if (!reason) return { ok: false, error: "invalid", field: "reason" };
    data.cancelledAt = at;
    data.cancelReason = reason;
  }

  const updated = await payload.update({
    collection: "orders",
    where: { and: [{ id: { equals: id } }, { status: { equals: order.status } }] },
    data,
    depth: 0,
  });
  const saved = updated.docs[0] as Order | undefined;
  if (!saved) return { ok: false, error: "changed" };

  if (action === "ship") return { ok: true, status: to, emailed: await sendShippedEmail(saved) };
  return { ok: true, status: to };
}
