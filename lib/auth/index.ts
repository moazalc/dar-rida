import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins/email-otp";
import { isLocale, LOCALE_COOKIE } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { payloadClient } from "@/lib/payload";
import { siteUrl } from "@/lib/stripe";
import { ensureCustomer } from "@/lib/customers";
import { codeEmail } from "./emails";
import { authTables } from "./schema";

/** Where Better Auth's routes are served. */
export const AUTH_BASE_PATH = "/api/auth";
/** Session cookies are named "dr.session_token" and so on. */
const COOKIE_PREFIX = "dr";

/** Whether "Continue with Google" is set up. Without its keys the button is hidden. */
export function googleEnabled(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function localeFromCookie(cookie: string | null | undefined) {
  const match = cookie?.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]+)`));
  const value = match?.[1];
  return isLocale(value) ? value : "en";
}

async function build() {
  const payload = await payloadClient();
  return betterAuth({
    appName: "Dar Rida",
    baseURL: siteUrl(),
    basePath: AUTH_BASE_PATH,
    // Development servers move ports (3000 taken → 3002); production trusts only the site's own address.
    trustedOrigins: process.env.NODE_ENV === "production" ? [] : ["http://localhost:*", "http://127.0.0.1:*"],
    secret: process.env.BETTER_AUTH_SECRET || process.env.PAYLOAD_SECRET,
    database: drizzleAdapter(payload.db.drizzle, { provider: "pg", schema: authTables }),
    user: { modelName: "auth_user" },
    session: {
      modelName: "auth_session",
      expiresIn: 60 * 60 * 24 * 60, // 60 days…
      updateAge: 60 * 60 * 24, // …renewed at most once a day while she keeps using the site
    },
    account: {
      modelName: "auth_account",
      // Google verifies the email, so a Google sign-in and an email-code
      // sign-in with the same address are the same account.
      accountLinking: { enabled: true, trustedProviders: ["google", "email-otp"] },
    },
    verification: { modelName: "auth_verification" },
    rateLimit: {
      enabled: process.env.NODE_ENV === "production",
      storage: "database",
      modelName: "auth_rate_limit",
    },
    advanced: { cookiePrefix: COOKIE_PREFIX },
    socialProviders: googleEnabled()
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            prompt: "select_account",
          },
        }
      : {},
    databaseHooks: {
      user: {
        create: {
          // The shop's side of the account, made the moment she first signs in.
          after: async (user) => {
            await ensureCustomer({ id: user.id, email: user.email, name: user.name });
          },
        },
      },
    },
    plugins: [
      emailOTP({
        otpLength: 6,
        expiresIn: 10 * 60,
        allowedAttempts: 3,
        storeOTP: "hashed",
        async sendVerificationOTP({ email, otp }, ctx) {
          const locale = localeFromCookie(ctx?.headers?.get("cookie"));
          const message = codeEmail(otp, await getDictionary(locale), locale);
          try {
            await payload.sendEmail({ to: email, subject: message.subject, html: message.html, text: message.text });
          } catch (error) {
            payload.logger.error({ err: error }, "Sending a sign-in code failed");
            throw error;
          }
        },
      }),
      // Lets Server Actions set and clear the session cookie. Keep it last.
      nextCookies(),
    ],
  });
}

let instance: ReturnType<typeof build> | null = null;

/** The Better Auth server, built once on top of Payload's database connection. */
export function getAuth() {
  instance ??= build().catch((error) => {
    instance = null; // try again on the next request
    throw error;
  });
  return instance;
}

export type Auth = Awaited<ReturnType<typeof build>>;
