'use client'
import React, { useEffect, useState, useCallback } from 'react'
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

export interface NotificationMessage {
  type: string;
  data?: unknown;
  id?: string;
  title?: string;
  message?: string;
  created_at?: string;
  read_status?: boolean;
}

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
  const [socketInitialized, setSocketInitialized] = useState(false)
  const { setSubscriptions } = useProfileStore()
  const { telegramId } = useTelegram()
  const { setWalletAddress } = useTariffStore()
  const { setUnreadCount } = useNotificationsContext()
  const router = useRouter()

  // تعريف معالج رسائل WebSocket للإشعارات
  const handleWebSocketMessage = useCallback((message: NotificationMessage) => {
    console.log("📩 WebSocket message received:", message)

    // تحديث عداد الإشعارات غير المقروءة
    if (message.type === "unread_update") {
      const data = message.data as { count?: number }
      if (data?.count !== undefined) {
        setUnreadCount(data.count)
      }
      return
    }

    // التعامل مع إشعار جديد
    if (message.type === "new_notification") {
      const notificationData = message.data as NotificationData

      // إعادة تحميل قائمة الإشعارات
      queryClient.invalidateQueries({
        queryKey: ['notifications', telegramId]
      })

      // تحديد رسالة Toast بناءً على نوع الإشعار
      let toastMessage = notificationData.message
      const inviteLink = notificationData.extra_data?.invite_link

      // التعامل مع إشعارات تجديد الاشتراك
      if (notificationData.type === 'subscription_renewal' && notificationData.extra_data) {
        const expiryDate = notificationData.extra_data.expiry_date
          ? new Date(notificationData.extra_data.expiry_date)
          : null
        toastMessage = `✅ تم تجديد اشتراكك في ${notificationData.extra_data.subscription_type} حتى ${expiryDate?.toLocaleDateString('ar-EG')}`

        // تم إزالة منطق الدفع هنا

        // تحديث/إعادة تحميل بيانات الاشتراك
        queryClient.invalidateQueries({
          queryKey: ['subscriptions', telegramId]
        })
      }

      // عرض Toast مع التعامل مع حدث النقر
      showToast.success({
        message: toastMessage,
        onClick: () => {
          if (inviteLink) {
            window.open(inviteLink, '_blank')
          } else if (notificationData.id) {
            router.push(`/notifications/${notificationData.id}`)
          }
        }
      })
    }

    // إعادة تحميل الإشعارات عند تغيير حالة القراءة
    if (message.type === "notification_read") {
      queryClient.invalidateQueries({
        queryKey: ['notifications', telegramId]
      })
      queryClient.invalidateQueries({
        queryKey: ['unreadNotificationsCount', telegramId]
      })
    }
  }, [setUnreadCount, router, telegramId])

  const WebSocketInitializer = () => {
    const { connectionState } = useNotificationsSocket(
      socketInitialized ? telegramId : null,
      handleWebSocketMessage
    )
    useEffect(() => {
      const statusMap = {
        'connected': "🟢 Connected to notification service",
        'connecting': "🟠 Connecting to notification service…",
        'disconnected': "🔴 Disconnected from notification service"
      }
      console.log(statusMap[connectionState] || '⚪ Unknown connection state')
    }, [connectionState])
    return null
  }

  // 2) Splash + WebSocket delay (unchanged) …
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinDelayCompleted(true)
      setTimeout(() => setSocketInitialized(true), 1000)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // 3) Wallet address fetch (unchanged) …
  const {
    data: walletAddress,
    isLoading: isWalletLoading,
    isError: isWalletError,
    error: walletError
  } = useWalletAddress()

  useEffect(() => {
    if (walletAddress) setWalletAddress(walletAddress)
  }, [walletAddress, setWalletAddress])


  /* --- تحسين جلب الاشتراكات مع التخزين المؤقت --- */
  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!telegramId) return

      try {
        const cached = localStorage.getItem(`subscriptions_${telegramId}`)
        if (cached) {
          const { data, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < 5 * 60 * 1000) { // تخزين لمدة 5 دقائق
            console.log("📦 Using cached subscriptions")
            setSubscriptions(data)
            return
          }
        }
        // منطق جلب البيانات سيتم إضافته هنا لاحقاً
      } catch (error) {
        console.error('❌ Failed to fetch subscriptions:', error)
      }
    }

    fetchSubscriptions()
    const interval = setInterval(fetchSubscriptions, 5 * 60 * 1000) // تحديث كل 5 دقائق
    return () => clearInterval(interval)
  }, [telegramId, setSubscriptions])

  /* --- Prefetch للصفحات المهمة لتحسين التنقل --- */
  useEffect(() => {
    const prefetchPages = async () => {
      try {
        const pagesToPrefetch = ['/', '/plans', '/profile', '/notifications']
        await Promise.all(pagesToPrefetch.map(page => router.prefetch(page)))
        console.log("🔄 Prefetched important pages")
      } catch (error) {
        console.error('⚠️ Error during prefetch:', error)
      }
    }

    prefetchPages()
  }, [router])


    useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://alaghbry0.github.io/chat-widget/widget.min.js"
    script.async = true
    document.body.appendChild(script)

    script.onload = () => {
      window.ChatWidget?.init({
        projectId: "Exaado mini app",
        apiUrl:     "https://exadoo-rxr9.onrender.com/bot/chat/stream",
        theme:      "light",
        position:   "bottom-right",
        direction:  "rtl"
      })
    }

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const isDataLoaded = minDelayCompleted && !isWalletLoading
  if (!isDataLoaded) return <SplashScreen />
  if (isWalletError) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-red-500 text-center px-4">
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
      {socketInitialized && <WebSocketInitializer />}
      {children}
      <FooterNav />
      <NotificationToast />
    </>
  )
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <TelegramProvider>
      <QueryClientProvider client={queryClient}>
        <NotificationsProvider>
          <AppContent>
            <Component {...pageProps} />
          </AppContent>
          <ReactQueryDevtools initialIsOpen={false} />
        </NotificationsProvider>
      </QueryClientProvider>
    </TelegramProvider>
  )
}

export default MyApp