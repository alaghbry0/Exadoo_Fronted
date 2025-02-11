import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,  // ✅ تفعيل الوضع الصارم
  compress: true,  // ✅ تمكين الضغط لتسريع التحميل
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.telegram.org" }, // ✅ دعم صور Telegram
      { protocol: "https", hostname: "**" }, // ✅ السماح بأي صور خارجية
    ],
    minimumCacheTTL: 86400, // ✅ تخزين الصور في الكاش لمدة 24 ساعة
    unoptimized: true, // ✅ تعطيل تحسين الصور للسماح بتحميلها كما هي
  },
  async headers() {
    return [
      {
        source: "/api/:path*", // ✅ تمكين CORS على جميع الـ API
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
      {
        source: "/_next/static/(.*)", // ✅ تحسين التخزين المؤقت للملفات الثابتة
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*', // ✅ توجيه أي طلب يبدأ بـ /api/ إلى TonAPI
        destination: 'https://tonapi.io/v1/:path*', // نطاق TonAPI المستهدف
      },
    ];
  },
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (isServer) {
      config.resolve.fallback = { fs: false }; // ✅ تعطيل `fs` لمنع أخطاء الخادم
    }
    return config;
  },
  env: {
    NEXT_PUBLIC_WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || "", // ✅ تحميل المتغيرات البيئية من `.env`
  },
};

export default nextConfig;