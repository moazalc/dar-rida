import path from "node:path";
import type { CollectionConfig } from "payload";
import { isAdmin } from "../access";

/**
 * Uploaded photos. Files live on the server's disk in `MEDIA_DIR` (outside the
 * build), so a redeploy never wipes them.
 */
export const Media: CollectionConfig = {
  slug: "media",
  admin: { group: "Shop" },
  access: { read: () => true, create: isAdmin, update: isAdmin, delete: isAdmin },
  upload: {
    staticDir: process.env.MEDIA_DIR || path.resolve(process.cwd(), "media"),
    mimeTypes: ["image/*"],
  },
  fields: [{ name: "alt", label: "Alt text", type: "text", required: true, localized: true }],
};
