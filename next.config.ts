import type { NextConfig } from "next";

// Cache Components is intentionally off: every page is per-user and rendered at request time.
const nextConfig: NextConfig = {
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
