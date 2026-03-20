import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  turbopack: {
    resolveAlias: {
      // Prevent Node.js canvas polyfill errors with pdfjs-dist
      canvas: { browser: "./empty-module.js" },
    },
  },
};

export default nextConfig;
