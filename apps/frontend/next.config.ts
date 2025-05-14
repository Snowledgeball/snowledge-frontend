import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  transpilePackages: ["@repo/ui"],
  output: "standalone",
};

export default nextConfig;
