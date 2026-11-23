import "server-only";

import { cookies, headers } from "next/headers";
import { getRequestLanguage } from "payload";
import type { AdminLang } from "@/cms/admin/i18n";
import { adminUser } from "@/lib/admin-session";
import { payloadClient } from "@/lib/payload";

/**
 * The signed-in admin and the admin's interface language (Account → Language
 * in the admin, kept in Payload's language cookie). `user` is null for anyone
 * else, including signed-in shop customers.
 */
export async function printContext(): Promise<{ user: { id: number | string } | null; lang: AdminLang }> {
  const payload = await payloadClient();
  const [h, c] = await Promise.all([headers(), cookies()]);
  const lang = getRequestLanguage({ config: payload.config, cookies: c, headers: h }) === "ar" ? "ar" : "en";
  return { user: await adminUser(), lang };
}
