import "server-only";

import config from "@payload-config";
import { getPayload } from "payload";

/** The Payload local API for server code. It skips access rules, so check inputs before calling it. */
export function payloadClient() {
  return getPayload({ config });
}
