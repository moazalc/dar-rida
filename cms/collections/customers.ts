import type { CollectionConfig } from "payload";
import { shippingCountries } from "@/lib/shipping-countries";
import { isAdmin } from "../access";
import { measurementsField } from "../fields";

const names = new Intl.DisplayNames(["en"], { type: "region" });
const countryOptions = shippingCountries
  .map((c) => ({ label: names.of(c) ?? c, value: c }))
  .sort((a, b) => a.label.localeCompare(b.label));

/**
 * Customer accounts. Signing in (email code or Google) is handled by Better
 * Auth in its own `auth_*` tables; this is the shop's side of the account:
 * details, saved measurements and addresses, created on first sign-in.
 * Customers never sign in to the admin, and nothing here is reachable through
 * Payload's public API without an admin login.
 */
export const Customers: CollectionConfig = {
  slug: "customers",
  labels: { singular: { en: "Customer", ar: "عميلة" }, plural: { en: "Customers", ar: "العملاء" } },
  admin: {
    group: { en: "Shop", ar: "المتجر" },
    useAsTitle: "email",
    defaultColumns: ["email", "name", "phone", "createdAt"],
    listSearchableFields: ["email", "name", "phone"],
    description: "People who have signed in to the shop. Guests who never signed in are only on their orders.",
  },
  defaultSort: "-createdAt",
  access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
  hooks: {
    // Deleting a customer here also deletes their sign-in, so the account is gone.
    afterDelete: [
      async ({ doc }) => {
        if (!doc.authUserId) return;
        const { deleteAuthUser } = await import("@/lib/auth/admin");
        await deleteAuthUser(doc.authUserId);
      },
    ],
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "email", type: "email", required: true, unique: true, index: true, admin: { readOnly: true } },
        { name: "name", type: "text" },
        { name: "phone", type: "text" },
      ],
    },
    {
      name: "profiles",
      label: "Saved measurements",
      type: "array",
      labels: { singular: "Profile", plural: "Profiles" },
      admin: { initCollapsed: true, components: { RowLabel: "/cms/components/customer-row-labels#ProfileRowLabel" } },
      fields: [{ name: "name", type: "text", required: true }, ...measurementsField()],
    },
    {
      name: "addresses",
      type: "array",
      labels: { singular: "Address", plural: "Addresses" },
      admin: { initCollapsed: true, components: { RowLabel: "/cms/components/customer-row-labels#AddressRowLabel" } },
      fields: [
        {
          type: "row",
          fields: [
            { name: "name", label: "Full name", type: "text", required: true },
            { name: "phone", type: "text" },
            { name: "isDefault", label: "Default", type: "checkbox", defaultValue: false },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "line1", label: "Address line 1", type: "text", required: true },
            { name: "line2", label: "Address line 2", type: "text" },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "city", type: "text", required: true },
            { name: "state", label: "State / emirate", type: "text" },
            { name: "postalCode", label: "Postcode", type: "text" },
            { name: "country", type: "select", required: true, options: countryOptions },
          ],
        },
      ],
    },
    {
      // Signed-in orders and guest orders with her email, as her account shows them.
      name: "orders",
      type: "ui",
      admin: { components: { Field: "/cms/admin/customer-orders#CustomerOrders" } },
    },
    {
      type: "collapsible",
      label: "Sign-in",
      admin: { initCollapsed: true },
      fields: [
        { name: "authUserId", label: "Sign-in ID", type: "text", unique: true, index: true, admin: { readOnly: true } },
        { name: "stripeCustomerId", label: "Stripe customer", type: "text", admin: { readOnly: true } },
      ],
    },
  ],
};
