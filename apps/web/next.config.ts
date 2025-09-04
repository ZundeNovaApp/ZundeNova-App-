import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'dist',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  transpilePackages: ["@zundenova/ui", "@zundenova/shared"],
};

export default nextConfig;
