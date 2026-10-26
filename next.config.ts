import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product photos come from Shopify's CDN.
    remotePatterns: [new URL("https://cdn.shopify.com/**")],
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

export default nextConfig;
