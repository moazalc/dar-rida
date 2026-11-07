import type { Endpoint } from "payload";
import type { EmailChoice } from "@/lib/orders/notify";

const choices: EmailChoice[] = ["missing", "owner", "customer"];

/** POST /api/orders/:id/resend-emails, admin only: { which: "missing" | "owner" | "customer" }. */
export const resendEmailsEndpoint: Endpoint = {
  path: "/:id/resend-emails",
  method: "post",
  handler: async (req) => {
    if (!req.user) return Response.json({ error: "Not allowed" }, { status: 401 });
    const id = Number(req.routeParams?.id);
    if (!Number.isInteger(id) || id < 1) return Response.json({ error: "Unknown order" }, { status: 400 });
    const body = (await req.json?.().catch(() => ({}))) as { which?: unknown };
    const which = choices.includes(body?.which as EmailChoice) ? (body.which as EmailChoice) : "missing";
    // Loaded on request: the email code is server-only and must stay out of the
    // Payload config that the CLI (seed, migrations) also imports.
    const { sendOrderEmails } = await import("@/lib/orders/notify");
    const sent = await sendOrderEmails(id, which);
    return Response.json({ sent });
  },
};
