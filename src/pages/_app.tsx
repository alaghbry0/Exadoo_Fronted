// src/pages/_app.tsx
"use client";
import React, { useEffect, useState, useMemo } from "react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import "@/styles/globals.css";
import FooterNav from "@/shared/components/layout/FooterNav";
import SplashScreen from "@/shared/components/common/SplashScreen";
import { useTelegram } from "@/shared/context/TelegramContext";
import { useTariffStore } from "@/shared/state/zustand";
import { fetchBotWalletAddress } from "@/domains/payments/api";
import {
  QueryClient,
  useQuery,
  useQueryClient as useTanstackQueryClient,
} from "@tanstack/react-query";
import { useUserStore } from "@/shared/state/zustand/userStore";
import { NotificationToast } from "@/domains/notifications/components/NotificationToast";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useNotificationStream } from "@/shared/hooks/useNotificationStream";
import GlobalAuthSheet from "@/domains/auth/components/GlobalAuthSheet";
import ErrorBoundary from "@/shared/components/ErrorBoundary";
import logger from "@/infrastructure/logging/logger";
import { AppProviders } from "@/shared/providers";
import { useServiceWorkerRegistration } from "@/shared/hooks/useServiceWorkerRegistration";
import { useStartAppNavigation } from "@/shared/hooks/useStartAppNavigation";

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
  useServiceWorkerRegistration();

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

  useStartAppNavigation({
    router,
    isTelegramApp,
    isTelegramReady,
    showSplashScreen,
    stablePath,
  });

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
  const tonManifestUrl =
    process.env.NEXT_PUBLIC_TON_MANIFEST_URL ??
    "https://exadooo-plum.vercel.app/tonconnect-manifest.json";

  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === "development"}>
      <AppProviders
        queryClient={globalQueryClient}
        tonManifestUrl={tonManifestUrl}
      >
        <AppContent hideFooter={hideFooter}>
          <Component {...pageProps} />
        </AppContent>
        <GlobalAuthSheet />
        <ReactQueryDevtools initialIsOpen={false} />
      </AppProviders>
    </ErrorBoundary>
  );
}

export default MyApp;
