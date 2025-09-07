'use client'
import React, { useEffect, useState, useRef } from 'react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import '../styles/globals.css'
import FooterNav from '../components/FooterNav'
import SplashScreen from '../components/SplashScreen'
import { TelegramProvider, useTelegram } from '../context/TelegramContext'
import { useTariffStore } from '../stores/zustand'
import { fetchBotWalletAddress } from '../services/api'
import { QueryClient, QueryClientProvider, useQuery, useQueryClient as useTanstackQueryClient } from '@tanstack/react-query'
import { useProfileStore } from '../stores/profileStore'
import { NotificationToast } from '../components/NotificationToast'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { NotificationsProvider } from '@/context/NotificationsContext'
import { useNotificationStream } from '@/hooks/useNotificationStream'

// ===================== startapp helpers =====================
type StartAppParam = string | null;

// خريطة الأسماء المختصرة -> مسارات داخل التطبيق
const ROUTE_MAP: Record<string, string> = {
  shop: '/shop',
  plans: '/plans',
  profile: '/profile',
  notifications: '/notifications',
};

function readStartAppParam(): StartAppParam {
  // من تيليجرام
  const tg = window.Telegram?.WebApp;
  const tgParam =
    tg?.initDataUnsafe?.start_param ||
    tg?.initDataUnsafe?.startapp ||
    tg?.initData?.start_param;
  if (tgParam && typeof tgParam === 'string') return tgParam;

  // من المتصفح (للاختبار)
  try {
    const sp = new URLSearchParams(globalThis.location?.search || '');
    return sp.get('startapp') || sp.get('tgWebAppStartParam') || sp.get('start_param');
  } catch {
    return null;
  }
}

function resolveTargetRoute(startParam: string): string | null {
  // شكل مباشر: startapp=shop
  if (ROUTE_MAP[startParam]) return ROUTE_MAP[startParam];

  // شكل route:/path?x=1 (معاملات مركّبة، مشفّرة)
  if (startParam.startsWith('route:')) {
    const raw = decodeURIComponent(startParam.slice('route:'.length));
    if (raw.startsWith('/')) return raw; // أمان بسيط
  }

  // شكل namespaced: shop?plan=pro
  const [name, qs] = startParam.split('?');
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
      gcTime: 10 * 60 * 1000
    }
  }
})

// Hook مخصص لجلب عنوان المحفظة
const useWalletAddress = () => {
  return useQuery({
    queryKey: ['walletAddress'],
    queryFn: fetchBotWalletAddress,
    retry: 3,
    staleTime: 15 * 60 * 1000,
  });
}

// ===================== AppContent =====================
function AppContent({ children }: { children: React.ReactNode }) {
  const [minDelayCompleted, setMinDelayCompleted] = useState(false);
  const { setSubscriptions } = useProfileStore();
  const { isTelegramApp, isTelegramReady, isLoading: isTelegramLoading, telegramId } = useTelegram();
  const { setWalletAddress } = useTariffStore();
  const router = useRouter();
  const queryClient = useTanstackQueryClient();
  const didRouteRef = useRef(false);

  // إشعارات عبر SSE
  useNotificationStream();

  // سبلاش مينيوم
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinDelayCompleted(true);
      console.log("⏱️ Minimum splash delay completed.");
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // جلب المحفظة
  const {
    data: walletAddress,
    isLoading: isWalletLoading,
    isError: isWalletError,
    error: walletError
  } = useWalletAddress();

  useEffect(() => {
    if (walletAddress) {
      console.log("🏦 Wallet address fetched:", walletAddress);
      setWalletAddress(walletAddress);
    }
  }, [walletAddress, setWalletAddress]);

  // الاشتراكات (كاش محلي)
  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!telegramId) return;
      try {
        const cached = localStorage.getItem(`subscriptions_${telegramId}`);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            console.log("📦 Using cached subscriptions for:", telegramId);
            setSubscriptions(data);
            return;
          } else {
            console.log("🗑️ Cached subscriptions expired for:", telegramId);
          }
        }
      } catch (error) {
        console.error(`❌ Failed to fetch/load subscriptions for ${telegramId}:`, error);
      }
    };
    fetchSubscriptions();
    const interval = setInterval(fetchSubscriptions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [telegramId, setSubscriptions]);

  // Prefetch صفحات مهمة
  useEffect(() => {
    const prefetchPages = async () => {
      try {
        const pagesToPrefetch = ['/', '/plans', '/profile', '/notifications'];
        await Promise.all(pagesToPrefetch.map(page => router.prefetch(page)));
        console.log("🔄 Prefetched important pages:", pagesToPrefetch.join(', '));
      } catch (error) {
        console.error('⚠️ Error during page prefetch:', error);
      }
    };
    prefetchPages();
  }, [router]);

  // شرط السبلاتش
  const showSplashScreen =
    !minDelayCompleted ||
    isWalletLoading ||
    isTelegramLoading ||
    (isTelegramApp && !isTelegramReady);

  console.log("⏳ Splash Screen Conditions:", {
    minDelayCompleted,
    isWalletLoading,
    isTelegramLoading,
    isTelegramApp,
    isTelegramReady,
    showSplashScreen
  });

  // ======= التوجيه الديناميكي حسب startapp =======
  useEffect(() => {
    // نفّذ مرة واحدة بعد الجاهزية
    if (didRouteRef.current) return;

    const ready = !showSplashScreen && (!isTelegramApp || isTelegramReady);
    if (!ready) return;

    const raw = readStartAppParam();
    if (!raw) return;

    const target = resolveTargetRoute(raw);
    if (!target) return;

    // لا تعيد التوجيه لو أنت أصلاً على نفس الصفحة
    if (router.asPath.split('?')[0] === target.split('?')[0]) {
      didRouteRef.current = true;
      return;
    }

    didRouteRef.current = true;
    router.replace(target).catch(console.error);

    // تنظيف باراميترات الواجهة (اختياري)
    try {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    } catch {}
  }, [isTelegramApp, isTelegramReady, showSplashScreen, router]);
  // ================================================

  if (showSplashScreen) {
    return <SplashScreen />;
  }

  if (isWalletError) {
    console.error("❌ Wallet Address fetch error:", walletError);
    return (
      <div className="flex flex-col justify-center items-center h-screen text-red-500 text-center px-4">
        <p className="mb-2">حدث خطأ أثناء تحميل بيانات المحفظة.</p>
        {process.env.NODE_ENV === 'development' && (
          <p className="text-xs text-gray-400 mb-4">{(walletError as Error)?.message || String(walletError)}</p>
        )}
        <button
          onClick={() => queryClient.refetchQueries({ queryKey: ['walletAddress'] })}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  console.log(`✅ App Ready. Running inside Telegram: ${isTelegramApp}. Telegram ID: ${telegramId || 'N/A'}`);

  return (
    <>
      {children}
      <FooterNav />
      <NotificationToast />
    </>
  );
}

// ===================== MyApp =====================
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <TelegramProvider>
      <QueryClientProvider client={globalQueryClient}>
        <NotificationsProvider>
          <AppContent>
            <Component {...pageProps} />
          </AppContent>
          <ReactQueryDevtools initialIsOpen={false} />
        </NotificationsProvider>
      </QueryClientProvider>
    </TelegramProvider>
  );
}

export default MyApp;
