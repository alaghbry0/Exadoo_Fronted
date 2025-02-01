import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["api.telegram.org"], // ✅ السماح بتحميل الصور من Telegram API فقط
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.telegram.org",
        pathname: "/file/bot**/**", // ✅ السماح بالصور من `bot`
      },
    ],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 512], // ✅ دعم عدة أحجام للصور
    deviceSizes: [320, 420, 768, 1024, 1200], // ✅ دعم الأجهزة المختلفة
    formats: ["image/webp"], // ✅ تحسين الأداء عبر دعم WebP
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.fallback = { fs: false };
    }
    return config;
  },
};

export default nextConfig;
