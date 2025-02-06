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
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
    ];
  },
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (isServer) config.resolve.fallback = { fs: false };
    return config;
  },
  env: {
    NEXT_PUBLIC_WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || "", // ✅ استيراد من `.env`
  },
};

export default nextConfig; // ✅ تأكد من أن هذا السطر موجود
