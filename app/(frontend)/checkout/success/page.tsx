import type { Metadata } from "next";
import Link from "next/link";
import { StatusPage, statusAction } from "@/components/status-page";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { payloadClient } from "@/lib/payload";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary(await getLocale())).checkout;
  return { title: t.metaTitle, robots: { index: false } };
}

/**
 * Where Stripe sends the customer after paying. It only reads: the order is
 * marked paid by the webhook, which may land a moment after this page.
 */
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = (await searchParams).session_id;
  const sessionId = typeof raw === "string" && /^cs_[A-Za-z0-9_]{10,200}$/.test(raw) ? raw : null;
  const dict = await getDictionary(await getLocale());
  const t = dict.checkout;

  const order = sessionId
    ? (
        await (await payloadClient()).find({
          collection: "orders",
          where: { stripeCheckoutSessionId: { equals: sessionId } },
          limit: 1,
          depth: 0,
        })
      ).docs[0]
    : undefined;

  const paid = order && order.status !== "pending_payment";
  const title = paid ? t.title : t.pendingTitle;
  const body = !order
    ? t.unknownBody
    : paid
      ? `${t.body.replace("{number}", order.number ?? "")}${order.customerEmail ? ` ${t.emailSent.replace("{email}", order.customerEmail)}` : ""}`
      : t.pendingBody;

  return (
    <StatusPage code="✓" title={title} body={body}>
      <Link href="/collection" className={statusAction.primary}>
        {t.continue}
      </Link>
    </StatusPage>
  );
}
