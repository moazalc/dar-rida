import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Carts } from "./cms/collections/carts";
import { Designs } from "./cms/collections/designs";
import { Media } from "./cms/collections/media";
import { Orders } from "./cms/collections/orders";
import { Users } from "./cms/collections/users";
import { StoreSettings } from "./cms/globals/store-settings";
import { migrations } from "./cms/migrations";

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
  admin: {
    user: Users.slug,
    importMap: { baseDir: dirname },
    meta: { titleSuffix: " — Dar Rida admin" },
  },
  collections: [Orders, Designs, Media, Users, Carts],
  globals: [StoreSettings],
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
  }),
  email,
  sharp,
  graphQL: { disablePlaygroundInProduction: true },
});
