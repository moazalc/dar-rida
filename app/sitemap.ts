import type { MetadataRoute } from "next";
import { payloadClient } from "@/lib/payload";
import { siteUrl } from "@/lib/stripe";

/** The public pages and every design on sale. The language is a cookie, so each page has one address. */
export const dynamic = "force-dynamic";

const pages = ["", "/collection", "/size-guide", "/fabrics", "/shipping", "/returns", "/faq", "/contact", "/privacy", "/terms"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const payload = await payloadClient();
  const { docs } = await payload.find({
    collection: "designs",
    where: { active: { equals: true } },
    sort: "sortOrder",
    depth: 0,
    limit: 200,
    select: { slug: true, updatedAt: true },
  });
  return [
    ...pages.map((path) => ({ url: `${base}${path}`, changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.6 })),
    ...docs.map((d) => ({ url: `${base}/collection/${d.slug}`, lastModified: d.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
