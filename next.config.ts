import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,

  images: {
    unoptimized: true,
  },

  async headers() {
    return [
      // CORS للـ API
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
      // Cache للأصول الثابتة
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // سياسة CSP شاملة
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              // مصادر افتراضية
              "default-src 'self';",
              // جافاسكربت
              "script-src 'self' https://telegram.org https://alaghbry0.github.io 'unsafe-inline' 'unsafe-eval';",
              "script-src-elem 'self' https://telegram.org https://alaghbry0.github.io;",
              // ستايلات
              "style-src 'self' 'unsafe-inline';",
              // اتصالات
              "connect-src 'self' https://exadoo-rxr9.onrender.com wss://exadoo-rxr9.onrender.com http://192.168.0.96:5000 wss://192.168.0.96:5000 https://tonapi.io https://bridge.tonapi.io wss://*.tonapi.io https://vercel.live https://raw.githubusercontent.com;",
              // صور
              "img-src * data:;",
              // خطوط
              "font-src 'self';",
              // iframes
              "frame-src 'self' https://telegram.org https://wallet.tg https://connect.tonhubapi.com;",
              // وسائط
              "object-src 'self';",
            ].join(" ").replace(/\n/g, ' '),
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://tonapi.io/v1/:path*",
      },
    ];
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  env: {
    NEXT_PUBLIC_WEBHOOK_SECRET: process.env.WEBHOOK_SECRET ?? "",
  },
};

export default nextConfig;