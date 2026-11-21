import path from "node:path";
import type { CollectionConfig } from "payload";
import { isAdmin } from "../access";

/**
 * Uploaded photos. Files live on the server's disk in `MEDIA_DIR` (outside the
 * build), so a redeploy never wipes them.
 */
export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: { en: "Photo", ar: "صورة" }, plural: { en: "Photos", ar: "الصور" } },
  admin: { group: { en: "Shop", ar: "المتجر" } },
  access: { read: () => true, create: isAdmin, update: isAdmin, delete: isAdmin },
  upload: {
    staticDir: process.env.MEDIA_DIR || path.resolve(process.cwd(), "media"),
    // Photos only. No SVG: it can carry script and next/image can't resize it.
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  },
  fields: [{ name: "alt", label: "Alt text", type: "text", required: true, localized: true }],
};
