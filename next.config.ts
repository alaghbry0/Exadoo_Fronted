import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,

  images: {
    unoptimized: true,
  },

  async headers() {
    return [
      // يمكنك إزالة هذا الجزء الخاص بـ CORS لأنه لن يحل المشكلة الحالية
      // {
      //   source: "/api/:path*",
      //   headers: [
      //     { key: "Access-Control-Allow-Origin", value: "*" },
      //     { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
      //     { key: "Access-Control-Allow-Headers", value: "Content-Type" },
      //   ],
      // },
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
              "default-src 'self';",
              "script-src 'self' https://telegram.org https://alaghbry0.github.io 'unsafe-inline' 'unsafe-eval';",
              "script-src-elem 'self' https://telegram.org https://alaghbry0.github.io;",
              "style-src 'self' 'unsafe-inline';",
              // <-- تم التحديث هنا: إضافة نطاقات الاتصال الضرورية
              "connect-src 'self' https://exadoo.onrender.com  https://exadoo-rxr9.onrender.com  https://exaado.plebits.com http://192.168.0.96:5000 http://localhost:5002 https://exadoo-sse-server.onrender.com https://tonapi.io https://bridge.tonapi.io https://cdn.echooo.xyz https://tonconnectbridge.mytonwallet.org https://tonhub.com https://bridge2.tonapi.io wss://*.tonapi.io https://go-bridge.tomo.inc https://ton-bridge.tobiwallet.app https://bridge.dewallet.pro https://dapp.gateio.services  https://ton-bridge.safepal.com  https://toncenter.com https://*.toncdn.io https://vercel.live https://wallet-bridge.fintopio.com https://tc.architecton.su https://ton-connect.mytokenpocket.vip https://bridge.mirai.app  https://wallet.binance.com https://www.okx.com https://ton-connect-bridge.bgwapi.io https://connect.tonhubapi.com https://raw.githubusercontent.com https://walletbot.me;",

              "img-src 'self' data: blob: https: *.githubusercontent.com *.bnbstatic.com *.okx.com *.tonhub.com *.mytonwallet.io *.tonkeeper.com *.tg *.tobiwallet.app *.bitgetimg.com *.gatedataimg.com *.delab-team;",
              "font-src 'self';",
              "frame-src 'self' https://telegram.org https://wallet.tg https://connect.tonhubapi.com;",
              "object-src 'self';",
            ].join(" ").replace(/\n/g, ' '),
          },
        ],
      },
    ];
  },


   async rewrites() {
    return [
      // قم بإزالة أو تحويل هذا الجزء إلى تعليق
      // {
      //   source: '/api/services/:path*',
      //   destination: 'https://exaado.plebits.com/api/getAllServicesForMiniApp/:path*',
      // },
      {
        source: "/api/ton/:path*",
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