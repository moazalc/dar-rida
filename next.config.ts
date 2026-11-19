import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
