'use client'
import React, { useEffect, useState } from 'react'
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
import { useNotificationStream } from '@/hooks/useNotificationStream' // ✨ 1. استيراد الـ hook الجديد

// ❌ تم إزالة استيراد: useNotificationsSocket, useNotificationsContext, showToast, useCallback, useRef

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

// Hook مخصص لجلب عنوان المحفظة مع استخدام React Query
const useWalletAddress = () => {
  return useQuery({
    queryKey: ['walletAddress'],
    queryFn: fetchBotWalletAddress,
    retry: 3,
    staleTime: 15 * 60 * 1000,
  });
}

// المكون الذي يحتوي على منطق التطبيق الرئيسي وشاشة البداية
function AppContent({ children }: { children: React.ReactNode }) {
  const [minDelayCompleted, setMinDelayCompleted] = useState(false);
  const { setSubscriptions } = useProfileStore();
  const { isTelegramApp, isTelegramReady, isLoading: isTelegramLoading, telegramId } = useTelegram();
  const { setWalletAddress } = useTariffStore();
  const router = useRouter();
  const queryClient = useTanstackQueryClient();

  // ✨ 2. تشغيل الـ hook الخاص بـ SSE في الخلفية ✨
  // هذا الـ hook سيعالج الآن كل ما يتعلق بالإشعارات (الاتصال، استقبال الرسائل، التوست، تحديث الحالة)
  useNotificationStream();

  // ❌ 3. تم إزالة كل المنطق المتعلق بـ WebSocket بالكامل ❌
  // - تم حذف useRef لـ handleWebSocketMessageRef
  // - تم حذف useEffect لمعالجة رسائل WebSocket
  // - تم حذف useCallback لـ stableWebSocketMessageHandler
  // - تم حذف استدعاء useNotificationsSocket
  // - تم حذف useEffect لمراقبة connectionState

  // useEffect لتحديد اكتمال الحد الأدنى لوقت عرض شاشة البداية
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinDelayCompleted(true);
      console.log("⏱️ Minimum splash delay completed.");
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // جلب عنوان المحفظة باستخدام Hook المخصص
  const {
    data: walletAddress,
    isLoading: isWalletLoading,
    isError: isWalletError,
    error: walletError
  } = useWalletAddress();

  // useEffect لتحديث عنوان المحفظة في Zustand store عند جلبه بنجاح
  useEffect(() => {
    if (walletAddress) {
        console.log("🏦 Wallet address fetched:", walletAddress);
        setWalletAddress(walletAddress);
    }
  }, [walletAddress, setWalletAddress]);

  // الكود الحالي لجلب الاشتراكات (يبقى كما هو)
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

  // useEffect لجلب الصفحات الهامة مسبقًا لتحسين الأداء
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

  // شرط إظهار شاشة البداية (يبقى كما هو)
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

  if (showSplashScreen) {
    return <SplashScreen />;
  }

  // التعامل مع خطأ تحميل المحفظة (يبقى كما هو)
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

// المكون الرئيسي للتطبيق (يبقى كما هو)
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