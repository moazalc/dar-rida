import "server-only";

import { eq } from "@payloadcms/db-postgres/drizzle";
import { payloadClient } from "@/lib/payload";
import { authUser } from "./schema";

/** Remove a person's sign-in (and with it their sessions and linked Google account). */
export async function deleteAuthUser(id: string): Promise<void> {
  const payload = await payloadClient();
  await payload.db.drizzle.delete(authUser).where(eq(authUser.id, id));
}
