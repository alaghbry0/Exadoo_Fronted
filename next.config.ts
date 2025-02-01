import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["api.telegram.org"], // ✅ السماح بتحميل الصور من Telegram API
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.fallback = { fs: false };
    }
    return config;
  },
};

export default nextConfig;
