import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A self-contained server in .next/standalone, for the Docker image (Dockerfile).
  output: "standalone",
  // Don't tell visitors (and scanners) what the site runs on.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
          // Only the site itself may frame its pages (the admin's previews do).
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
        ],
      },
      {
        // The house photos and the hero video in public/media. They are replaced
        // under the same name, so a day's cache, not forever.
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
  // fast-geoip reads its data files at runtime, which the file tracer can't see.
  outputFileTracingIncludes: {
    "/**": ["./node_modules/fast-geoip/data/**", "./node_modules/.pnpm/fast-geoip@*/node_modules/fast-geoip/data/**"],
  },
  images: {
    // Photos uploaded in the admin are served by Payload.
    localPatterns: [{ pathname: "/api/media/file/**" }, { pathname: "/media/**" }],
  },
  // Reads its GeoLite data files from its own folder, so it must not be bundled.
  serverExternalPackages: ["fast-geoip"],
  experimental: {
    // Two root layouts (the shop and the admin), so unmatched URLs need their own 404.
    globalNotFound: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
