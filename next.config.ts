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
    unoptimized: true, // ✅ تعطيل تحسين الصور لجميع الصور
  },
  webpack: (config, { isServer }) => {
    if (isServer) config.resolve.fallback = { fs: false }
    return config
  },
};

export default nextConfig;