// src/pages/_app.tsx
"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import "@/styles/globals.css";
import FooterNav from "@/shared/components/layout/FooterNav";
import SplashScreen from "@/shared/components/common/SplashScreen";
import { TelegramProvider, useTelegram } from "@/shared/context/TelegramContext";
import { useTariffStore } from "@/shared/state/zustand";
import { fetchBotWalletAddress } from "@/domains/payments/api";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient as useTanstackQueryClient,
} from "@tanstack/react-query";
import { useUserStore } from "@/shared/state/zustand/userStore";
import { NotificationToast } from "@/domains/notifications/components/NotificationToast";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NotificationsProvider } from "@/domains/notifications/context/NotificationsContext";
import { useNotificationStream } from "@/domains/notifications/hooks/useNotificationStream";
import GlobalAuthSheet from "@/domains/auth/components/GlobalAuthSheet";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import ErrorBoundary from "@/shared/components/ErrorBoundary";
import logger from "@/infrastructure/logging/logger";
import { registerServiceWorker } from "@/infrastructure/serviceWorker/registerServiceWorker";

// ===================== startapp helpers =====================
type StartAppParam = string | null;

const ROUTE_MAP: Record<string, string> = {
  shop: "/shop",
  plans: "/plans",
  profile: "/profile",
  notifications: "/notifications",
};

function readStartAppParam(): StartAppParam {
  const tg = (globalThis as any)?.Telegram?.WebApp;
  const tgParam =
    tg?.initDataUnsafe?.start_param ||
    tg?.initDataUnsafe?.startapp ||
    tg?.initData?.start_param;
  if (tgParam && typeof tgParam === "string") return tgParam;

  try {
    const sp = new URLSearchParams(globalThis.location?.search || "");
    return (
      sp.get("startapp") ||
      sp.get("tgWebAppStartParam") ||
      sp.get("start_param")
    );
  } catch {
    return null;
  }
}

function resolveTargetRoute(startParam: string): string | null {
  if (ROUTE_MAP[startParam]) return ROUTE_MAP[startParam];

  if (startParam.startsWith("route:")) {
    const raw = decodeURIComponent(startParam.slice("route:".length));
    if (raw.startsWith("/")) return raw;
  }

  const [name, qs] = startParam.split("?");
  if (ROUTE_MAP[name]) return qs ? `${ROUTE_MAP[name]}?${qs}` : ROUTE_MAP[name];

  return null;
}
// ============================================================

export interface NotificationExtraData {
  invite_link?: string | null;
  subscription_type?: string;
  subscription_history_id?: number;
  expiry_date?: string;
  start_date?: string;
  payment_token?: string;
}

export interface NotificationData {
  id: number;
  type: string;
  title: string;
  message: string;
  created_at: string;
  read_status: boolean;
  extra_data?: NotificationExtraData;
}

const globalQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      gcTime: 10 * 60 * 1000,
    },
  },
});

// Hook مخصص لجلب عنوان المحفظة
const useWalletAddress = () =>
  useQuery({
    queryKey: ["walletAddress"],
    queryFn: fetchBotWalletAddress,
    retry: 3,
    staleTime: 15 * 60 * 1000,
  });

// ===================== AppContent =====================
function AppContent({
  children,
  hideFooter,
}: {
  children: React.ReactNode;
  hideFooter?: boolean;
}) {
  const [minDelayCompleted, setMinDelayCompleted] = useState(false);
  const { setSubscriptions } = useUserStore();
  const {
    isTelegramApp,
    isTelegramReady,
    isLoading: isTelegramLoading,
    telegramId,
  } = useTelegram();
  const { setWalletAddress } = useTariffStore();
  const router = useRouter();
  const queryClient = useTanstackQueryClient();
  const didRouteRef = useRef(false);

  // ===== 1) تطبيع المسار عند الإقلاع =====
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      // في بعض WebView النادر، pathname يطلع '' أو ما يبدأ بـ '/'.
      let p = window.location.pathname || "/";
      if (!p.startsWith("/")) p = `/${p}`;
      if (p === "" || p === "/index" || p === "/index.html") p = "/";
      // لو الـURL الأصلي جاء بدون سلاش نهائي، المتصفح عادةً يرصد '/'، بس نضمن توحيده:
      const finalUrl = p + window.location.search + window.location.hash;
      if (window.location.pathname !== p) {
        window.history.replaceState({}, "", finalUrl);
      }
    } catch {
      /* no-op */
    }
  }, []);

  // ===== 2) تسجيل Service Worker للتحكم في الصور =====
  useEffect(() => {
    if (typeof window !== "undefined") {
      registerServiceWorker().catch((err) => {
        logger.error("Service Worker registration failed", err);
      });
    }
  }, []);

  // ==== إشعارات SSE ====
  useNotificationStream();

  // ==== سبلاش مينيوم ====
  useEffect(() => {
    const timer = setTimeout(() => setMinDelayCompleted(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // ==== جلب المحفظة ====
  const {
    data: walletAddress,
    isLoading: isWalletLoading,
    isError: isWalletError,
    error: walletError,
  } = useWalletAddress();
  useEffect(() => {
    if (walletAddress) setWalletAddress(walletAddress);
  }, [walletAddress, setWalletAddress]);

  // ==== الاشتراكات (كاش محلي) ====
  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!telegramId) return;
      try {
        const cached = localStorage.getItem(`subscriptions_${telegramId}`);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            setSubscriptions(data);
            return;
          }
        }
      } catch (error) {
        logger.error(`Failed to load subscriptions for ${telegramId}`, error);
      }
    };
    fetchSubscriptions();
    const interval = setInterval(fetchSubscriptions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [telegramId, setSubscriptions]);

  // ==== Prefetch محسّن مع requestIdleCallback ====
  useEffect(() => {
    const prefetchOnIdle = () => {
      // استخدام requestIdleCallback للتحميل في وقت الفراغ
      if ("requestIdleCallback" in window) {
        requestIdleCallback(
          () => {
            // Prefetch الصفحات الأساسية فقط
            router.prefetch("/shop").catch(() => {});
            router.prefetch("/profile").catch(() => {});
          },
          { timeout: 2000 },
        );

        // Prefetch الصفحات الثانوية بعد تأخير
        requestIdleCallback(
          () => {
            router.prefetch("/plans").catch(() => {});
            router.prefetch("/notifications").catch(() => {});
          },
          { timeout: 5000 },
        );
      } else {
        // Fallback للمتصفحات القديمة
        setTimeout(() => {
          router.prefetch("/shop").catch(() => {});
          router.prefetch("/profile").catch(() => {});
        }, 1000);

        setTimeout(() => {
          router.prefetch("/plans").catch(() => {});
          router.prefetch("/notifications").catch(() => {});
        }, 3000);
      }
    };

    prefetchOnIdle();
  }, [router]);

  // ===== 2) حساب مسار ثابت وموحَّد (fallback على window.location) =====
  const stablePath = useMemo(() => {
    try {
      const routerPath = (router.asPath || "").split("?")[0].split("#")[0];
      const locPath =
        typeof window !== "undefined" ? window.location.pathname || "" : "";
      let p = routerPath || locPath || "/";
      if (!p.startsWith("/")) p = `/${p}`;
      if (p === "" || p === "/index" || p === "/index.html") p = "/";
      return p;
    } catch {
      return "/";
    }
  }, [router.asPath]);

  // ==== سياسة الفوتر المرنة (مع حالة فشل محسوبة) ====
  const showFooter = useMemo(() => {
    if (hideFooter) return false;
    // لو لسه مش واضح لأي سبب (حافة نادرة)، عدّه '/'
    const p = stablePath || "/";
    const allowPrefixes = [
      "/",
      "/shop",
      "/profile",
      "/plans",
      "/notifications",
    ];
    return allowPrefixes.some(
      (prefix) => p === prefix || p.startsWith(`${prefix}/`),
    );
  }, [hideFooter, stablePath]);

  // ==== شرط السبلاتش ====
  const showSplashScreen =
    !minDelayCompleted ||
    isWalletLoading ||
    isTelegramLoading ||
    (isTelegramApp && !isTelegramReady);

  // ==== توجيه startapp بعد الجاهزية ====
  useEffect(() => {
    if (didRouteRef.current) return;
    const ready = !showSplashScreen && (!isTelegramApp || isTelegramReady);
    if (!ready) return;

    const raw = readStartAppParam();
    if (!raw) return;

    const target = resolveTargetRoute(raw);
    if (!target) return;

    const targetPath = target.split("?")[0] || "/";
    if (stablePath === targetPath) {
      didRouteRef.current = true;
      return;
    }

    didRouteRef.current = true;
    router
      .replace(target)
      .catch((err) => logger.error("Route replace failed", err));

    try {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    } catch {}
  }, [isTelegramApp, isTelegramReady, showSplashScreen, router, stablePath]);

  if (showSplashScreen) {
    return <SplashScreen />;
  }

  if (isWalletError) {
    logger.error("Wallet Address fetch error", walletError);
    return (
      <div className="flex flex-col justify-center items-center h-screen text-red-500 text-center px-4">
        <p className="mb-2">حدث خطأ أثناء تحميل بيانات المحفظة.</p>
        {process.env.NODE_ENV === "development" && (
          <p className="text-xs text-gray-400 mb-4">
            {(walletError as Error)?.message || String(walletError)}
          </p>
        )}
        <button
          onClick={() =>
            queryClient.refetchQueries({ queryKey: ["walletAddress"] })
          }
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={showFooter ? "pb-16" : undefined}>{children}</div>
      {showFooter && <FooterNav currentPath={stablePath} />}
      <NotificationToast />
    </>
  );
}
// ===================== MyApp =====================
function MyApp({ Component, pageProps }: AppProps) {
  const hideFooter = Boolean((Component as any).hideFooter);

  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === "development"}>
      <TonConnectUIProvider
        manifestUrl={
          process.env.NEXT_PUBLIC_TON_MANIFEST_URL ??
          "https://exadooo-plum.vercel.app/tonconnect-manifest.json"
        }
      >
        <TelegramProvider>
          <QueryClientProvider client={globalQueryClient}>
            <NotificationsProvider>
              <AppContent hideFooter={hideFooter}>
                <Component {...pageProps} />
              </AppContent>
              <GlobalAuthSheet />
              <ReactQueryDevtools initialIsOpen={false} />
            </NotificationsProvider>
          </QueryClientProvider>
        </TelegramProvider>
      </TonConnectUIProvider>
    </ErrorBoundary>
  );
}

export default MyApp;
