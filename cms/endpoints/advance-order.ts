import type { Endpoint } from "payload";
import { isOrderAction } from "@/lib/orders/fulfilment";

const MESSAGES: Record<string, string> = {
  "unknown-order": "This order no longer exists.",
  "not-allowed": "That step isn't possible from the order's current status.",
  changed: "Someone else just moved this order on. Reload to see it.",
};

/**
 * POST /api/orders/:id/advance, admin only:
 * { action: "start" | "ship" | "deliver" | "cancel", carrier?, trackingNumber?, trackingUrl?, reason? }
 */
export const advanceOrderEndpoint: Endpoint = {
  path: "/:id/advance",
  method: "post",
  handler: async (req) => {
    if (!req.user) return Response.json({ error: "Not allowed" }, { status: 401 });
    const id = Number(req.routeParams?.id);
    if (!Number.isInteger(id) || id < 1) return Response.json({ error: "Unknown order" }, { status: 400 });
    const body = ((await req.json?.().catch(() => ({}))) ?? {}) as Record<string, unknown>;
    if (!isOrderAction(body.action)) return Response.json({ error: "Unknown step" }, { status: 400 });
    // Loaded on request: the order code is server-only and must stay out of the
    // Payload config that the CLI (seed, migrations) also imports.
    const { advanceOrder } = await import("@/lib/orders/advance");
    const by = typeof req.user.email === "string" ? req.user.email : `user ${req.user.id}`;
    const result = await advanceOrder(id, body.action, body, by);
    if (result.ok) return Response.json(result);
    if (result.error === "invalid") return Response.json({ error: "invalid", field: result.field }, { status: 400 });
    return Response.json({ error: MESSAGES[result.error] }, { status: result.error === "changed" ? 409 : 400 });
  },
};
