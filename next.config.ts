import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["api.telegram.org"], // ✅ السماح بتحميل الصور من Telegram API
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.telegram.org",
        pathname: "/file/bot**/**", // ✅ السماح لأي صورة من `bot`
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.fallback = { fs: false };
    }
    return config;
  },
};

export default nextConfig;
