import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "exaado.plebits.com",
        pathname: "/uploads/**",
      },
    ],
    // ✅ إزالة unoptimized لتفعيل تحسينات Next.js
    unoptimized: false,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/image",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/api/image-proxy",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self';",
              "script-src 'self' https://telegram.org https://alaghbry0.github.io 'unsafe-inline' 'unsafe-eval';",
              "script-src-elem 'self' https://telegram.org https://alaghbry0.github.io;",
              "style-src 'self' 'unsafe-inline';",
              "connect-src 'self' https://exadoo.onrender.com https://exadoo-rxr9.onrender.com https://exaado.plebits.com http://192.168.0.96:5000 http://localhost:5002 https://exadoo-sse-server.onrender.com https://tonapi.io https://bridge.tonapi.io https://cdn.echooo.xyz https://tonconnectbridge.mytonwallet.org https://tonhub.com https://bridge2.tonapi.io wss://*.tonapi.io https://go-bridge.tomo.inc https://ton-bridge.tobiwallet.app https://bridge.dewallet.pro https://dapp.gateio.services https://ton-bridge.safepal.com https://toncenter.com https://*.toncdn.io https://vercel.live https://wallet-bridge.fintopio.com https://tc.architecton.su https://ton-connect.mytokenpocket.vip https://bridge.mirai.app https://wallet.binance.com https://www.okx.com https://ton-connect-bridge.bgwapi.io https://connect.tonhubapi.com https://raw.githubusercontent.com https://walletbot.me;",
              "img-src 'self' data: blob: https:;",
              "font-src 'self';",
              "frame-src 'self' https://telegram.org https://wallet.tg https://connect.tonhubapi.com;",
              "object-src 'self';",
            ].join(" "),
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