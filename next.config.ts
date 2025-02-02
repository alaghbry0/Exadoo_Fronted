import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.telegram.org",
      },
    ],
    minimumCacheTTL: 86400,
  },
  webpack: (config, { isServer }) => {
    if (isServer) config.resolve.fallback = { fs: false }
    return config
  },
};

export default nextConfig;