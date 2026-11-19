import type { CollectionConfig } from "payload";
import { isAdmin, nobody } from "../access";
import { resendEmailsEndpoint } from "../endpoints/resend-emails";
import { advanceOrderEndpoint } from "../endpoints/advance-order";
import { formatOrderMoney, measurementsField } from "../fields";
import { carrierOptions } from "@/lib/orders/fulfilment";

export const orderStatuses = [
  { label: "Awaiting payment", value: "pending_payment" },
  { label: "Paid", value: "paid" },
  { label: "In production", value: "in_production" },
  { label: "Shipped", value: "shipped" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
] as const;

export type OrderStatus = (typeof orderStatuses)[number]["value"];

/** Order numbers come from the database's own sequential id, so two checkouts can never share one. */
export function orderNumber(id: number): string {
  return `DR-${1000 + id}`;
}

const readOnly = { readOnly: true } as const;

/**
 * Orders. Each is a snapshot taken at checkout: names, choices, measurements
 * and prices exactly as bought, so later edits to a design never change an
 * order. Created by the checkout and marked paid only by Stripe's webhook.
 */
export const Orders: CollectionConfig = {
  slug: "orders",
  labels: { singular: { en: "Order", ar: "طلب" }, plural: { en: "Orders", ar: "الطلبات" } },
  admin: {
    group: { en: "Shop", ar: "المتجر" },
    useAsTitle: "number",
    defaultColumns: ["number", "status", "customerName", "shippingCountry", "formattedTotal", "readyBy", "createdAt"],
    listSearchableFields: ["number", "customerName", "customerEmail"],
    description: "Paid orders appear here once Stripe confirms the payment.",
    components: { beforeListTable: ["/cms/admin/order-tabs#OrderTabs"] },
  },
  defaultSort: "-createdAt",
  endpoints: [resendEmailsEndpoint, advanceOrderEndpoint],
  access: { read: isAdmin, create: nobody, update: isAdmin, delete: isAdmin },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== "create" || doc.number) return doc;
        const number = orderNumber(doc.id);
        await req.payload.update({ collection: "orders", id: doc.id, data: { number }, req });
        return { ...doc, number };
      },
    ],
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "number", type: "text", unique: true, index: true, admin: readOnly },
        {
          name: "status",
          type: "select",
          required: true,
          defaultValue: "pending_payment",
          options: [...orderStatuses],
          index: true,
          // Moved on only by the step buttons above (and Stripe's webhook), so no step is skipped by mistake.
          admin: { readOnly: true },
        },
        {
          name: "formattedTotal",
          label: "Total",
          type: "text",
          virtual: true,
          admin: readOnly,
          hooks: { afterRead: [({ siblingData }) => formatOrderMoney(siblingData?.total, siblingData?.currency)] },
        },
      ],
    },
    {
      name: "progress",
      type: "ui",
      admin: { components: { Field: "/cms/components/order-progress#OrderProgress" } },
    },
    {
      type: "collapsible",
      label: { en: "Making and shipping", ar: "التنفيذ والشحن" },
      admin: { initCollapsed: true },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "readyBy",
              label: "Ready by",
              type: "date",
              admin: {
                date: { pickerAppearance: "dayOnly", displayFormat: "d MMM yyyy" },
                description: "Set from the slowest piece when production starts. Change it for this order if needed.",
              },
            },
            { name: "productionStartedAt", label: "Production started", type: "date", admin: { ...readOnly, date: { pickerAppearance: "dayAndTime" } } },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "carrier", label: "Courier", type: "select", options: carrierOptions, admin: readOnly },
            { name: "trackingNumber", label: "Tracking number", type: "text", admin: readOnly },
            { name: "trackingUrl", label: "Tracking link", type: "text", admin: readOnly },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "shippedAt", label: "Shipped", type: "date", admin: { ...readOnly, date: { pickerAppearance: "dayAndTime" } } },
            { name: "expectedDelivery", label: "Expected delivery", type: "date", admin: { ...readOnly, date: { pickerAppearance: "dayOnly", displayFormat: "d MMM yyyy" } } },
            { name: "deliveredAt", label: "Delivered", type: "date", admin: { ...readOnly, date: { pickerAppearance: "dayAndTime" } } },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "cancelledAt", label: "Cancelled", type: "date", admin: { ...readOnly, date: { pickerAppearance: "dayAndTime" } } },
            { name: "cancelReason", label: "Reason for cancelling", type: "textarea", admin: readOnly },
          ],
        },
        {
          name: "history",
          label: "Steps",
          type: "array",
          admin: { ...readOnly, initCollapsed: true, description: "Who moved the order on, and when." },
          fields: [
            {
              type: "row",
              fields: [
                { name: "status", type: "select", options: [...orderStatuses], required: true },
                { name: "at", type: "date", required: true, admin: { date: { pickerAppearance: "dayAndTime" } } },
                { name: "by", type: "text" },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "resendEmails",
      type: "ui",
      admin: { components: { Field: "/cms/components/resend-emails#ResendEmails" } },
    },
    {
      name: "lines",
      type: "array",
      admin: { readOnly: true, initCollapsed: false },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "kind",
              type: "select",
              required: true,
              options: [
                { label: "Collection design", value: "design" },
                { label: "Custom abaya", value: "custom" },
              ],
            },
            { name: "name", type: "text", required: true },
            { name: "nameAr", label: "Name (Arabic)", type: "text" },
            { name: "quantity", type: "number", required: true },
            { name: "unitPrice", label: "Unit price (minor units)", type: "number", required: true },
          ],
        },
        { name: "design", type: "relationship", relationTo: "designs" },
        {
          name: "choices",
          type: "array",
          admin: { condition: (_, sibling) => sibling?.kind === "custom" },
          fields: [
            {
              type: "row",
              fields: [
                { name: "label", type: "text" },
                { name: "value", type: "text" },
              ],
            },
          ],
        },
        // The builder's raw choices, kept so emails can name them in the customer's language.
        { name: "config", type: "json", admin: { hidden: true } },
        ...measurementsField(true),
        { name: "notes", type: "textarea" },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "market",
          type: "select",
          defaultValue: "global",
          options: [
            { label: "UAE (AED)", value: "uae" },
            { label: "Global (USD)", value: "global" },
          ],
          admin: readOnly,
        },
        { name: "currency", type: "text", defaultValue: "usd", admin: readOnly },
        { name: "shippingCountry", label: "Ships to", type: "text", admin: { ...readOnly, description: "Checkout only accepted an address in this country." } },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "subtotal",
          label: "Subtotal",
          type: "number",
          required: true,
          admin: { ...readOnly, description: "Minor units of the order's currency (cents or fils): 150000 is 1,500.00." },
        },
        { name: "shipping", label: "Shipping", type: "number", defaultValue: 0, admin: readOnly },
        { name: "shippingZone", label: "Shipping zone", type: "text", admin: readOnly },
        { name: "total", label: "Total", type: "number", required: true, admin: readOnly },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "presentmentAmount",
          label: "Paid in customer's currency (minor units)",
          type: "number",
          admin: readOnly,
        },
        { name: "presentmentCurrency", label: "Customer's currency", type: "text", admin: readOnly },
      ],
    },
    {
      type: "collapsible",
      label: "Customer",
      fields: [
        {
          type: "row",
          fields: [
            { name: "customerName", label: "Name", type: "text", admin: readOnly },
            { name: "customerEmail", label: "Email", type: "email", index: true, admin: readOnly },
            { name: "customerPhone", label: "Phone", type: "text", admin: readOnly },
          ],
        },
        {
          name: "customer",
          label: "Account",
          type: "relationship",
          relationTo: "customers",
          index: true,
          admin: { ...readOnly, description: "Set when the customer was signed in at checkout." },
        },
        {
          name: "shippingAddress",
          type: "group",
          admin: readOnly,
          fields: [
            {
              type: "row",
              fields: [
                { name: "line1", type: "text" },
                { name: "line2", type: "text" },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "city", type: "text" },
                { name: "state", type: "text" },
                { name: "postalCode", type: "text" },
                { name: "country", type: "text" },
              ],
            },
          ],
        },
        {
          name: "locale",
          type: "select",
          defaultValue: "en",
          options: [
            { label: "English", value: "en" },
            { label: "Arabic", value: "ar" },
          ],
          admin: readOnly,
        },
      ],
    },
    {
      type: "collapsible",
      label: "Payment",
      admin: { initCollapsed: true },
      fields: [
        { name: "stripeCheckoutSessionId", type: "text", unique: true, index: true, admin: readOnly },
        { name: "stripePaymentIntentId", type: "text", admin: readOnly },
        { name: "paidAt", type: "date", admin: { ...readOnly, date: { pickerAppearance: "dayAndTime" } } },
        { name: "ownerNotifiedAt", type: "date", admin: { ...readOnly, date: { pickerAppearance: "dayAndTime" } } },
        { name: "customerNotifiedAt", type: "date", admin: { ...readOnly, date: { pickerAppearance: "dayAndTime" } } },
        { name: "shippedEmailSentAt", label: "Shipped email sent", type: "date", admin: { ...readOnly, date: { pickerAppearance: "dayAndTime" } } },
        { name: "cartToken", type: "text", admin: { hidden: true } },
      ],
    },
  ],
};
