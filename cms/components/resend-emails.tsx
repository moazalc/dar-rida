"use client";

import { Button, toast, useDocumentInfo, useFormFields } from "@payloadcms/ui";
import { useState } from "react";

/**
 * On a paid order: send again any order email that failed to go out, or, on
 * purpose, the customer's confirmation or the owners' notice.
 */
export function ResendEmails() {
  const { id } = useDocumentInfo();
  const status = useFormFields(([fields]) => fields.status?.value as string | undefined);
  const ownerSent = useFormFields(([fields]) => Boolean(fields.ownerNotifiedAt?.value));
  const customerSent = useFormFields(([fields]) => Boolean(fields.customerNotifiedAt?.value));
  const [busy, setBusy] = useState(false);

  if (!id || !status || status === "pending_payment") return null;

  async function send(which: "missing" | "owner" | "customer") {
    setBusy(true);
    try {
      const res = await fetch(`/api/orders/${id}/resend-emails`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ which }),
      });
      const body = (await res.json().catch(() => ({}))) as { sent?: string[]; error?: string };
      if (!res.ok) throw new Error(body.error || "Sending failed");
      toast.success(body.sent?.length ? `Sent: ${body.sent.join(", ")}` : "Nothing to send");
      if (body.sent?.length) setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sending failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 24 }}>
      {(!ownerSent || !customerSent) && (
        <Button buttonStyle="primary" size="small" disabled={busy} onClick={() => send("missing")} margin={false}>
          Send unsent emails
        </Button>
      )}
      <Button buttonStyle="secondary" size="small" disabled={busy} onClick={() => send("customer")} margin={false}>
        Resend customer confirmation
      </Button>
      <Button buttonStyle="secondary" size="small" disabled={busy} onClick={() => send("owner")} margin={false}>
        Resend owner notice
      </Button>
    </div>
  );
}
