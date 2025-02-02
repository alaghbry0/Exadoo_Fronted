import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.telegram.org",
        pathname: "/file/bot*/**", // استخدام * كبديل لأي نص في هذا الجزء
      },
    ],
    imageSizes: [96, 128, 256],
    deviceSizes: [320, 420, 768, 1024],
    formats: ["image/webp"],
    minimumCacheTTL: 86400, // زيادة مدة التخزين المؤقت
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.fallback = { fs: false };
    }
    return config;
  },
};

export default nextConfig;