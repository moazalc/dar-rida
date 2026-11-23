import type { MetadataRoute } from "next";
import { publishedLocales } from "@/lib/i18n/config";
import { alternatesFor } from "@/lib/i18n/seo";
import { payloadClient } from "@/lib/payload";
import { siteUrl } from "@/lib/stripe";

/** The public pages and every design on sale, once per published language, each listing its other languages. */
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
  const entries = (path: string, extra: Omit<MetadataRoute.Sitemap[number], "url">) =>
    publishedLocales.map((locale) => {
      const { canonical, languages } = alternatesFor(path, locale, base);
      return { url: canonical, alternates: { languages }, ...extra };
    });
  return [
    ...pages.flatMap((path) => entries(path || "/", { changeFrequency: "weekly", priority: path === "" ? 1 : 0.6 })),
    ...docs.flatMap((d) => entries(`/collection/${d.slug}`, { lastModified: d.updatedAt, changeFrequency: "weekly", priority: 0.8 })),
  ];
}
