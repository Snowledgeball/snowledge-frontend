// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   reactStrictMode: true,
//   transpilePackages: ["@repo/ui"],
//   output: "standalone",
// };

// export default nextConfig;
const path = require("path");

module.exports = {
  reactStrictMode: true,
  transpilePackages: ["@repo/ui", "@repo/ui-core"],
  output: "standalone",
  // experimental: {
  outputFileTracingRoot: path.join(__dirname, "../../"),
  // },
};