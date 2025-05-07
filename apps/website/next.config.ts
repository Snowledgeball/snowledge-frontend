import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**',
      },
      // ... autres patterns existants ...
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: ["images.unsplash.com", "ui-avatars.com", "gateway.pinata.cloud", "example.com", "indigo-hidden-meerkat-77.mypinata.cloud"],
  },
};

export default nextConfig;
