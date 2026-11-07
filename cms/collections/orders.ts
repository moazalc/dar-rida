import type { CollectionConfig } from "payload";
import { isAdmin, nobody } from "../access";
import { resendEmailsEndpoint } from "../endpoints/resend-emails";
import { formatUsd, measurementsField } from "../fields";

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
  admin: {
    group: "Shop",
    useAsTitle: "number",
    defaultColumns: ["number", "status", "customerName", "formattedTotal", "createdAt"],
    listSearchableFields: ["number", "customerName", "customerEmail"],
    description: "Paid orders appear here once Stripe confirms the payment.",
  },
  defaultSort: "-createdAt",
  endpoints: [resendEmailsEndpoint],
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
        },
        {
          name: "formattedTotal",
          label: "Total",
          type: "text",
          virtual: true,
          admin: readOnly,
          hooks: { afterRead: [({ siblingData }) => formatUsd(siblingData?.total)] },
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
            { name: "unitPrice", label: "Unit price (cents)", type: "number", required: true },
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
        measurementsField(true),
        { name: "notes", type: "textarea" },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "subtotal", label: "Subtotal (cents)", type: "number", required: true, admin: readOnly },
        { name: "total", label: "Total (cents)", type: "number", required: true, admin: readOnly },
        { name: "currency", type: "text", defaultValue: "usd", admin: readOnly },
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
            { name: "customerEmail", label: "Email", type: "email", admin: readOnly },
            { name: "customerPhone", label: "Phone", type: "text", admin: readOnly },
          ],
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
        { name: "cartToken", type: "text", admin: { hidden: true } },
      ],
    },
  ],
};
