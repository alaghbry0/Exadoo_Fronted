// next.config.ts
import type { NextConfig } from "next";
import withBundleAnalyzer from '@next/bundle-analyzer';

const isDev = process.env.NODE_ENV !== "production";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: "https", hostname: "exaado.plebits.com", pathname: "/uploads/**" },
    ],
    unoptimized: false,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    // تخص فقط /_next/image (كويسة تفضل زي ما هي)
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  async headers() {
    // WebSocket للسخانة أثناء التطوير
    const devConnectSrc = isDev ? " ws://localhost:* ws://127.0.0.1:*" : "";

    // اختياري: حصر الإ嵌ام داخل تلغرام والمتصفح نفسه (تعديل حسب حاجتك)
    const frameAncestors = [
      "'self'",
      "https://web.telegram.org",
      "https://*.telegram.org",
    ].join(" ");

    const csp = [
      "default-src 'self';",
      // 👇 حافظت على قائمتك + blob للاحتياط
      "script-src 'self' https://telegram.org https://alaghbry0.github.io 'unsafe-inline' 'unsafe-eval' blob:;",
      "script-src-elem 'self' https://telegram.org https://alaghbry0.github.io;",
      "style-src 'self' 'unsafe-inline';",
      // 👇 سمحنا بـ ws في dev فقط
      `connect-src 'self' https://config.ton.org https://exadoo.onrender.com https://exadoo-rxr9.onrender.com https://exaado.plebits.com http://192.168.0.96:5000 http://localhost:5002 https://exadoo-sse-server.onrender.com https://cdn.echooo.xyz https://tonhub.com https://tonapi.io https://bridge.tonapi.io https://cdn.echooo.xyz https://tonconnectbridge.mytonwallet.org https://tonhub.com https://bridge2.tonapi.io wss://*.tonapi.io https://go-bridge.tomo.inc https://ton-bridge.tobiwallet.app https://bridge.dewallet.pro https://dapp.gateio.services https://ton-bridge.safepal.com https://toncenter.com https://*.toncdn.io https://vercel.live https://wallet-bridge.fintopio.com https://tc.architecton.su https://ton-connect.mytokenpocket.vip https://bridge.mirai.app https://wallet.binance.com https://www.okx.com https://ton-connect-bridge.bgwapi.io https://connect.tonhubapi.com https://raw.githubusercontent.com https://walletbot.me${devConnectSrc};`,
      "media-src 'self' https: data: blob:;",
      "img-src 'self' https: data: blob:;",
      // 👇 سمحنا data: لأن بعض الخطوط تكون inline
      "font-src 'self' data:;",
      "frame-src 'self' https://telegram.org https://wallet.tg https://connect.tonhubapi.com https://*.plebits.com https://*.exaado.com;",
      "object-src 'none';",
      // 🔐 مهم للـ HLS worker
      "worker-src 'self' blob:;",
      "child-src 'self' blob:;",
      // 🧱 أمان إضافي مفيد:
      "base-uri 'self';",
      "form-action 'self';",
      // امنع مواقع غريبة من تضمين موقعك (عدّل حسب حاجتك)
      `frame-ancestors ${frameAncestors};`,
      // ملاحظة: لا نفعّل upgrade-insecure-requests لأن عندك مصادر http في الشبكة الداخلية
    ].join(" ");

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
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/_next/image",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, stale-while-revalidate=86400" }],
      },
      {
        // 👍 كاش ثابت لملفات المشغّل
        source: "/players/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/api/image-proxy",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=604800" }],
      },
      {
        source: "/:path*",
        headers: [{ key: "Content-Security-Policy", value: csp }],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/api/ton/:path*",
        destination: "https://tonapi.io/v1/:path*",
      },
      {
        source: "/tonapi/:path*",
        destination: "https://tonapi.io/v1/:path*",
      },
    ];
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { ...config.resolve.fallback, net: false, tls: false };
    }
    return config;
  },

};

export default bundleAnalyzer(nextConfig);
