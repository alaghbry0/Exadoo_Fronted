// _app.tsx
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
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { useProfileStore } from '../stores/profileStore'
import { NotificationToast } from '../components/NotificationToast'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useNotificationsSocket } from '@/hooks/useNotificationsSocket'
import { NotificationsProvider, useNotificationsContext } from '@/context/NotificationsContext'
import { showToast } from '@/components/ui/Toast'

type NotificationMessage = {
  type?: string;
  data?: {
    message?: string;
    invite_link?: string;
    expiry_date?: string;
    count?: number;
  };
  unread_count?: number;
};

// إنشاء QueryClient
const queryClient = new QueryClient({
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

const useWalletAddress = () => {
  return useQuery({
    queryKey: ['walletAddress'],
    queryFn: fetchBotWalletAddress,
    retry: 3
  })
}

function AppContent({ children }: { children: React.ReactNode }) {
  const [minDelayCompleted, setMinDelayCompleted] = useState(false)
  const { setSubscriptions } = useProfileStore()
  const { telegramId } = useTelegram()
  const { setWalletAddress } = useTariffStore()
  const { setUnreadCount } = useNotificationsContext()
  const router = useRouter()

  const {
    data: walletAddress,
    isLoading: isWalletLoading,
    isError: isWalletError,
    error: walletError
  } = useWalletAddress()

  // استخدام النسخة المحسنة من هوك useNotificationsSocket مع استرجاع حالة الاتصال
  const { isConnected } = useNotificationsSocket<NotificationMessage>(telegramId, (data) => {
    if (data.type === "unread_update" && data.data?.count !== undefined) {
      setUnreadCount(data.data.count);
    }
    if (data.type === "subscription_renewal") {
      showToast.success({
        message: data.data?.message || 'تم تجديد الاشتراك بنجاح',
        action: data.data?.invite_link
          ? {
              text: 'انضم الآن',
              onClick: () => {
                if (data.data?.invite_link) {
                  window.open(data.data.invite_link, '_blank');
                }
              }
            }
          : undefined
      });
    }
  });

  // عرض مؤشر حالة الاتصال بالإشعارات
  useEffect(() => {
    if (isConnected) {
      console.log("🟢 تم الاتصال بالإشعارات");
      // يمكن هنا تعديل واجهة المستخدم لإظهار حالة الاتصال إذا لزم الأمر
    } else {
      console.log("🔴 تم فقدان الاتصال بالإشعارات");
    }
  }, [isConnected]);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!telegramId) return
      try {
        const cached = localStorage.getItem('subscriptions')
        if (cached) {
          const { data, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < 300000) {
            setSubscriptions(data)
            return
          }
        }
        // يمكنك إضافة منطق جلب الاشتراكات هنا
      } catch (error) {
        console.error('فشل في جلب الاشتراكات:', error)
      }
    }
    fetchSubscriptions()
    const interval = setInterval(fetchSubscriptions, 300000)
    return () => clearInterval(interval)
  }, [telegramId, setSubscriptions])

  useEffect(() => {
    const prefetchPages = async () => {
      try {
        await router.prefetch('/')
        await router.prefetch('/plans')
        await router.prefetch('/profile')
      } catch (error) {
        console.error('⚠️ خطأ أثناء التحميل المسبق:', error)
      }
    }
    prefetchPages()
  }, [router])

  useEffect(() => {
    const timer = setTimeout(() => setMinDelayCompleted(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (walletAddress) {
      setWalletAddress(walletAddress)
    }
  }, [walletAddress, setWalletAddress])

  const isDataLoaded = minDelayCompleted && !isWalletLoading
  const hasError = isWalletError

  if (!isDataLoaded) return <SplashScreen />
  if (hasError) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-center px-4">
        <p>❌ خطأ في تحميل البيانات: {walletError?.toString()}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          إعادة المحاولة
        </button>
      </div>
    )
  }

  return (
    <>
      {children}
      <FooterNav />
      <NotificationToast />
    </>
  )
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <TelegramProvider>
      <NotificationsProvider>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <AppContent>
            <Component {...pageProps} />
          </AppContent>
        </QueryClientProvider>
      </NotificationsProvider>
    </TelegramProvider>
  )
}

export default MyApp
