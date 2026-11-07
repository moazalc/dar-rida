import "server-only";

import type { Order } from "@/cms/payload-types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { payloadClient } from "@/lib/payload";
import { siteUrl } from "@/lib/stripe";
import { customerEmail, ownerEmail } from "./emails";

export type EmailChoice = "missing" | "owner" | "customer";

/**
 * Send a paid order's emails and stamp each one when it goes out. "missing"
 * sends only those not yet sent (after a failure); "owner" or "customer"
 * resends that one on purpose. A failed send is logged and left unstamped,
 * so it can be sent again from the order page in the admin.
 */
export async function sendOrderEmails(orderId: number, which: EmailChoice = "missing"): Promise<string[]> {
  const payload = await payloadClient();
  const order = (await payload.findByID({ collection: "orders", id: orderId, depth: 0 })) as Order;
  if (order.status === "pending_payment") return [];
  const sent: string[] = [];

  const wantOwner = which === "owner" || (which === "missing" && !order.ownerNotifiedAt);
  const wantCustomer = which === "customer" || (which === "missing" && !order.customerNotifiedAt);

  if (wantOwner) {
    const settings = await payload.findGlobal({ slug: "store-settings" });
    const to = (settings.orderNotificationEmails ?? []).map((r) => r.email).filter(Boolean);
    if (to.length) {
      try {
        const email = ownerEmail(order, `${siteUrl()}/admin/collections/orders/${order.id}`);
        await payload.sendEmail({ to, subject: email.subject, html: email.html, text: email.text, replyTo: order.customerEmail ?? undefined });
        await payload.update({ collection: "orders", id: order.id, data: { ownerNotifiedAt: new Date().toISOString() } });
        sent.push("owner notice");
      } catch (error) {
        payload.logger.error({ err: error, order: order.number }, "Sending the new-order email failed");
      }
    } else {
      payload.logger.warn(`No new-order email addresses in Store settings, so ${order.number} was not emailed to the owners`);
    }
  }

  if (wantCustomer && order.customerEmail) {
    try {
      const locale = order.locale === "ar" ? "ar" : "en";
      const [dict, settings] = await Promise.all([
        getDictionary(locale),
        payload.findGlobal({ slug: "store-settings", locale }),
      ]);
      const email = customerEmail(order, dict, settings.defaultLeadTime ?? null);
      await payload.sendEmail({ to: order.customerEmail, subject: email.subject, html: email.html, text: email.text });
      await payload.update({ collection: "orders", id: order.id, data: { customerNotifiedAt: new Date().toISOString() } });
      sent.push("customer confirmation");
    } catch (error) {
      payload.logger.error({ err: error, order: order.number }, "Sending the order confirmation failed");
    }
  }

  return sent;
}
