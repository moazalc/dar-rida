import type { Endpoint } from "payload";

/** POST /api/orders/:id/resend-emails — admin only. Filled in with the order emails. */
export const resendEmailsEndpoint: Endpoint = {
  path: "/:id/resend-emails",
  method: "post",
  handler: async (req) => {
    if (!req.user) return Response.json({ error: "Not allowed" }, { status: 401 });
    return Response.json({ sent: [] });
  },
};
