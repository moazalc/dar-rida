import "server-only";

import { headers } from "next/headers";
import { payloadClient } from "@/lib/payload";

/**
 * The admin signed in to the Payload admin on this request, or null for
 * anyone else (shop customers included, and when the check itself fails).
 */
export async function adminUser(): Promise<{ id: number | string } | null> {
  const payload = await payloadClient();
  const { user } = await payload.auth({ headers: await headers() }).catch(() => ({ user: null }));
  return user && user.collection === "users" ? user : null;
}
