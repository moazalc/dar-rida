import "server-only";

import { headers } from "next/headers";
import { payloadClient } from "@/lib/payload";

/**
 * The admin signed in to the Payload admin on this request, or null for
 * anyone else: shop customers, and whenever the check itself fails
 * (database down included), so admin-only pages answer "not found", not an error.
 */
export async function adminUser(): Promise<{ id: number | string } | null> {
  try {
    const payload = await payloadClient();
    const { user } = await payload.auth({ headers: await headers() });
    return user && user.collection === "users" ? user : null;
  } catch {
    return null;
  }
}
