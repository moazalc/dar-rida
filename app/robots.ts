import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/stripe";

/**
 * Served outside the site password and the coming-soon page (see proxy.ts), so
 * crawlers always get an answer. While the site is closed (site password or
 * COMING_SOON) nothing is to be indexed; once open, only private pages are kept out.
 */
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const closed = Boolean(process.env.SITE_USERNAME && process.env.SITE_PASSWORD) || process.env.COMING_SOON === "1";
  if (closed) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/account", "/cart", "/checkout", "/search", "/styleguide", "/api/"] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
