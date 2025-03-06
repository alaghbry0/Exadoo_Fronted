import type { NextConfig } from "next";
import type { Configuration } from "webpack";

const nextConfig: NextConfig = {
  reactStrictMode: true, // تفعيل الوضع الصارم في React
  compress: true, // تمكين الضغط لتسريع تحميل الصفحات

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.telegram.org" }, // دعم صور Telegram
      { protocol: "https", hostname: "**" }, // السماح بأي صور خارجية
    ],
    minimumCacheTTL: 86400, // تخزين الصور في الكاش لمدة 24 ساعة
    unoptimized: true, // تعطيل تحسين الصور
  },

  async headers() {
    return [
      {
        source: "/api/:path*", // تمكين CORS على جميع الـ API
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
      {
        source: "/_next/static/(.*)", // تحسين التخزين المؤقت للملفات الثابتة
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // إعداد CSP لجميع الصفحات بحيث تُسمح بالموارد المطلوبة
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self';",
              "script-src 'self' https://telegram.org 'unsafe-inline' 'unsafe-eval';",
              "style-src 'self' 'unsafe-inline';",
              "connect-src 'self' wss://exadoo-rxr9.onrender.com https://exadoo-rxr9.onrender.com https://tonapi.io https://raw.githubusercontent.com https://bridge.tonapi.io;",
              // السماح بتحميل الصور من جميع المصادر باستخدام *
              "img-src * data:;",
              "font-src 'self';",
              // إزالة about:blank لتجنب أخطاء CSP
              "frame-src 'self' https://telegram.org https://wallet.tg;",
            ].join(" "),
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*", // توجيه أي طلب يبدأ بـ /api/ إلى TonAPI
        destination: "https://tonapi.io/v1/:path*", // نطاق TonAPI المستهدف
      },
    ];
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false
      };
    }
    return config;
  },

  env: {
    NEXT_PUBLIC_WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || "", // تحميل المتغيرات البيئية من .env
  },
};

export default nextConfig;
