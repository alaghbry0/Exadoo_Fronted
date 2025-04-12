import type { NextConfig } from "next";
import type { Configuration } from "webpack";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.telegram.org" },
      { protocol: "https", hostname: "**" },
    ],
    minimumCacheTTL: 86400,
    unoptimized: true,
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
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              // السياسات الأساسية
             "default-src 'self';",
              "script-src 'self' https://telegram.org 'unsafe-inline' 'unsafe-eval';",
              "style-src 'self' 'unsafe-inline';",
              "connect-src 'self' " +
                "wss://exadoo-rxr9.onrender.com " +
                "ws://192.168.0.96:5000 " +
                "https://exadoo-rxr9.onrender.com " +
                "wss://*.render.com " +
                "https://*.render.com " +
                "http://192.168.0.96:5000 " +
                "https://tonapi.io " +
                "https://vercel.live " +
                "https://raw.githubusercontent.com " +
                "https://bridge.tonapi.io;",
              "img-src * data:;",
              "font-src 'self';",
              "frame-src 'self' https://telegram.org https://wallet.tg;",
              "object-src 'self' data:;"

            ].join(" ").trim(),
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
        tls: false
      };
    }
    return config;
  },

  env: {
    NEXT_PUBLIC_WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || "",
  },
};

export default nextConfig;