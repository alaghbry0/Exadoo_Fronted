'use client'
import React, { useEffect, useState, useCallback, useRef } from 'react'
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
import { useNotificationsSocket, NotificationMessage as SocketNotificationMessage } from '@/hooks/useNotificationsSocket'
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
  const router = useRouter();
  const queryClient = useTanstackQueryClient()

  const handleWebSocketMessageRef = useRef<((message: SocketNotificationMessage) => void) | null>(null);

  useEffect(() => {
    handleWebSocketMessageRef.current = (message: SocketNotificationMessage) => {
      console.log("📩 WebSocket message received in _app.tsx:", message);

      if (message.type === "unread_update") {
        const data = message.data as { count?: number };
        if (data?.count !== undefined) {
          console.log(`🔄 Updating unread count via Context to: ${data.count}`);
          setUnreadCount(data.count);
        }
        return;
      }

      if (message.type === "new_notification") {
        const notificationData = message.data as NotificationData;
        console.log("✨ New notification received in _app.tsx:", notificationData);

        if (telegramId) {
          console.log(`🔄 Invalidating notifications for telegramId: ${telegramId} due to new_notification`);
          queryClient.invalidateQueries({ queryKey: ['notifications', telegramId] });
        } else {
          console.warn("⚠️ telegramId is null, cannot invalidate notification queries for new_notification.");
        }

        if (notificationData.type === 'subscription_renewal' && notificationData.extra_data) {
          const expiryDate = notificationData.extra_data.expiry_date
            ? new Date(notificationData.extra_data.expiry_date)
            : null;

          const formattedDate = expiryDate ? expiryDate.toLocaleDateString('ar-EG', { month: 'long', day: 'numeric', year: 'numeric' }) : 'تاريخ غير محدد';
          const toastMessage = `✅ تم تجديد اشتراكك في ${notificationData.extra_data.subscription_type || 'الخدمة'} حتى ${formattedDate} UTC+3`;
          const inviteLink = notificationData.extra_data.invite_link;

          const toastOnClick = () => {
            router.push(`/notifications/${notificationData.id}`);
            if (!notificationData.read_status && telegramId) { // Ensure telegramId is available
              queryClient.invalidateQueries({ queryKey: ['notifications', telegramId] });
            }
          };

          if (inviteLink) {
            showToast.success({
              message: toastMessage,
              action: {
                text: 'انضم إلى القناة',
                onClick: () => window.open(inviteLink, '_blank')
              },
              onClick: toastOnClick
            });
          } else {
            showToast.success({
              message: toastMessage,
              onClick: toastOnClick
            });
          }

          if (telegramId) {
            console.log(`🔄 Invalidating subscriptions for telegramId: ${telegramId} due to subscription_renewal`);
            queryClient.invalidateQueries({ queryKey: ['subscriptions', telegramId] });
          } else {
            console.warn("⚠️ telegramId is null, cannot invalidate subscription queries for subscription_renewal.");
          }
        }
      }

      if (message.type === "notification_read") {
        console.log("📖 Notification read message received in _app.tsx:", message.data);
        if (telegramId) {
          console.log(`🔄 Invalidating notifications and unread count for telegramId: ${telegramId} due to notification_read`);
          queryClient.invalidateQueries({ queryKey: ['notifications', telegramId] });
          queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount', telegramId] });
        } else {
          console.warn("⚠️ telegramId is null, cannot invalidate queries for notification_read.");
        }
      }
    };
  }, [setUnreadCount, telegramId, queryClient, router]); // Added router to dependencies as it's used inside

  const stableWebSocketMessageHandler = useCallback((message: SocketNotificationMessage) => {
    if (handleWebSocketMessageRef.current) {
      handleWebSocketMessageRef.current(message);
    }
  }, []);

  const { connectionState } = useNotificationsSocket(
    telegramId,
    stableWebSocketMessageHandler
  );

  useEffect(() => {
    if (!telegramId && connectionState === 'disconnected') {
      return;
    }
    const statusMap = {
      'connected': "🟢 Connected to notification service (_app.tsx)",
      'connecting': "🟠 Connecting to notification service… (_app.tsx)",
      'disconnected': "🔴 Disconnected from notification service (_app.tsx)"
    };
    console.log(statusMap[connectionState] || `⚪ Unknown connection state: ${connectionState} (_app.tsx)`);
  }, [connectionState, telegramId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinDelayCompleted(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const {
    data: walletAddress,
    isLoading: isWalletLoading,
    isError: isWalletError,
    error: walletError
  } = useWalletAddress();

  useEffect(() => {
    if (walletAddress) setWalletAddress(walletAddress);
  }, [walletAddress, setWalletAddress]);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!telegramId) return;
      try {
        const cached = localStorage.getItem(`subscriptions_${telegramId}`);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            console.log("📦 Using cached subscriptions");
            setSubscriptions(data);
            return;
          }
        }
      } catch (error) {
        console.error('❌ Failed to fetch subscriptions:', error);
      }
    };
    fetchSubscriptions();
    const interval = setInterval(fetchSubscriptions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [telegramId, setSubscriptions]);

  useEffect(() => {
    const prefetchPages = async () => {
      try {
        const pagesToPrefetch = ['/', '/plans', '/profile', '/notifications'];
        await Promise.all(pagesToPrefetch.map(page => router.prefetch(page)));
        console.log("🔄 Prefetched important pages");
      } catch (error) {
        console.error('⚠️ Error during prefetch:', error);
      }
    };
    prefetchPages();
  }, [router]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://alaghbry0.github.io/chat-widget/widget.min.js";
    script.async = true;
    document.body.appendChild(script);
    script.onload = () => {
      if (window.ChatWidget) { // Check if ChatWidget is available
        window.ChatWidget.init({
          projectId: "Exaado mini app",
          apiUrl: "https://exadoo-rxr9.onrender.com/bot/chat/stream",
          theme: "light",
          position: "bottom-right",
          direction: "rtl"
        });
      }
    };
    return () => {
      if (document.body.contains(script)) {
         document.body.removeChild(script);
      }
      if (window.ChatWidget && typeof window.ChatWidget.destroy === 'function') { // Check if destroy exists
        // window.ChatWidget.destroy(); // Uncomment if needed and available
      }
    };
  }, []);

  const isDataLoaded = minDelayCompleted && !isWalletLoading;
  if (!isDataLoaded) return <SplashScreen />;

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
    );
  }

  return (
    <>
      {children}
      <FooterNav />
      <NotificationToast />
    </>
  );
}

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