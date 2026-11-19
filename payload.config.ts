import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { ar } from "@payloadcms/translations/languages/ar";
import { en } from "@payloadcms/translations/languages/en";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Carts } from "./cms/collections/carts";
import { Customers } from "./cms/collections/customers";
import { Designs } from "./cms/collections/designs";
import { Media } from "./cms/collections/media";
import { Orders } from "./cms/collections/orders";
import { Users } from "./cms/collections/users";
import { Shipping } from "./cms/globals/shipping";
import { StoreSettings } from "./cms/globals/store-settings";
import { migrations } from "./cms/migrations";
import { t } from "./cms/admin/i18n";
import { adminRoute } from "./lib/admin-route";
import { authTables } from "./lib/auth/schema";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Email goes through any SMTP server. Without `SMTP_HOST` (e.g. in
 * development) Payload writes emails to the server log instead of sending.
 */
const email = process.env.SMTP_HOST
  ? nodemailerAdapter({
      defaultFromAddress: process.env.EMAIL_FROM || "orders@darrida.com",
      defaultFromName: "Dar Rida",
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      },
    })
  : undefined;

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || "",
  // Admin requests only count the login cookie from the site's own address. Development servers move
  // ports (3000 taken → 3002), so those are allowed too, outside production only.
  csrf: [
    ...(process.env.NEXT_PUBLIC_SITE_URL ? [process.env.NEXT_PUBLIC_SITE_URL] : []),
    ...(process.env.NODE_ENV === "production" ? [] : [3000, 3001, 3002, 3003].map((port) => `http://localhost:${port}`)),
  ],
  routes: { admin: adminRoute() },
  admin: {
    user: Users.slug,
    // The admin code stays in app/(payload)/admin whatever its public path (see proxy.ts).
    importMap: { baseDir: dirname, importMapFile: path.resolve(dirname, "app/(payload)/admin/importMap.js") },
    meta: { titleSuffix: " — Dar Rida admin" },
    components: {
      Nav: "/cms/admin/Nav#Nav",
      graphics: { Icon: "/cms/admin/graphics#Icon", Logo: "/cms/admin/graphics#Logo" },
      beforeLogin: ["/cms/admin/LoginBrand#LoginBrand"],
    },
    // Orders to act on, sales and visitors (cms/admin/dashboard), in place of Payload's collection cards.
    dashboard: {
      widgets: [{ slug: "overview", label: t("Overview", "نظرة عامة"), Component: "/cms/admin/dashboard/Overview#Overview", minWidth: "full" }],
      defaultLayout: [{ widgetSlug: "overview", width: "full" }],
    },
  },
  // The admin in English or Arabic, as each owner picks under Account.
  i18n: { supportedLanguages: { en, ar }, fallbackLanguage: "en" },
  collections: [Orders, Customers, Designs, Media, Users, Carts],
  globals: [StoreSettings, Shipping],
  localization: {
    locales: [
      { label: "English", code: "en" },
      { label: "العربية", code: "ar", rtl: true },
    ],
    defaultLocale: "en",
    fallback: true,
  },
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: { outputFile: path.resolve(dirname, "cms/payload-types.ts") },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || "" },
    // Development changes the schema on the fly; production runs the committed
    // migrations in `cms/migrations` when the server starts.
    push: process.env.NODE_ENV !== "production",
    migrationDir: path.resolve(dirname, "cms/migrations"),
    prodMigrations: migrations,
    // Customer sign-in tables (Better Auth), so migrations manage them too.
    beforeSchemaInit: [({ schema }) => ({ ...schema, tables: { ...schema.tables, ...authTables } })],
  }),
  email,
  sharp,
  graphQL: { disablePlaygroundInProduction: true },
});
