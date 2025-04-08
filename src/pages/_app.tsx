// _app.tsx
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

type NotificationMessage = {
  type?: string;
  data?: any;
  id?: string;
  title?: string;
  message?: string;
  created_at?: string;
  read_status?: boolean;
};

// Enhanced QueryClient with improved caching strategy
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      gcTime: 10 * 60 * 1000 // 10 minutes
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
  const [minDelayCompleted, setMinDelayCompleted] = useState(false);
  const { setSubscriptions } = useProfileStore();
  const { telegramId } = useTelegram();
  const { setWalletAddress } = useTariffStore();
  const { setUnreadCount } = useNotificationsContext();
  const router = useRouter();

  const {
    data: walletAddress,
    isLoading: isWalletLoading,
    isError: isWalletError,
    error: walletError
  } = useWalletAddress();

  // Enhanced WebSocket message handler with improved notification display
  const handleWebSocketMessage = useCallback((message: NotificationMessage) => {
    console.log("📩 WebSocket message received:", message);

    // Handle unread count updates
    if (message.type === "unread_update" && message.data?.count !== undefined) {
      setUnreadCount(message.data.count);
      return;
    }

    // Handle new notifications
    if (message.type === "new_notification") {
      const notificationData = message.data || message;

      // Invalidate notification queries to refresh lists
      queryClient.invalidateQueries({
        queryKey: ['notifications', telegramId]
      });

      // Show toast notification with appropriate action based on type
      let toastAction;
      let toastMessage = notificationData.message || 'تم استلام إشعار جديد';

      // Handle different notification types
      switch(notificationData.type) {
        case 'subscription_renewal':
          toastMessage = notificationData.message || 'تم تجديد الاشتراك بنجاح';
          if (notificationData.extra_data?.invite_link) {
            toastAction = {
              text: 'انضم الآن',
              onClick: () => window.open(notificationData.extra_data.invite_link, '_blank')
            };
          }
          break;

        case 'subscription_expiry':
          toastMessage = notificationData.message || 'اشتراكك على وشك الانتهاء';
          toastAction = {
            text: 'تجديد',
            onClick: () => router.push('/plans')
          };
          break;

        case 'payment_success':
          toastMessage = notificationData.message || 'تم استلام الدفعة بنجاح';
          break;
      }

      // Show toast with dynamic content
      showToast.success({
        message: toastMessage,
        action: toastAction,
        duration: 6000,
        onClose: () => {},
        onClick: () => {
          // Navigate to notification details
          if (notificationData.id) {
            router.push(`/notifications/${notificationData.id}`);
          }
        }
      });
    }

    // Handle notification read status updates
    if (message.type === "notification_read") {
      queryClient.invalidateQueries({
        queryKey: ['notifications', telegramId]
      });
      queryClient.invalidateQueries({
        queryKey: ['unreadNotificationsCount', telegramId]
      });
    }

  }, [setUnreadCount, router, telegramId]);

  // Enhanced WebSocket connection with improved state management
  const { isConnected, connectionState } = useNotificationsSocket(
    telegramId,
    handleWebSocketMessage
  );

  // Improved connection status logging with status tracking
  useEffect(() => {
    const logConnectionStatus = () => {
      const status = {
        'connected': "🟢 Connected to notification service",
        'connecting': "🟠 Connecting to notification service...",
        'disconnected': "🔴 Disconnected from notification service"
      }[connectionState];

      console.log(status || "⚪ Unknown connection state");
    };

    logConnectionStatus();
  }, [connectionState]);

  // Enhanced subscription fetching with better caching
  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!telegramId) return;

      try {
        const cached = localStorage.getItem(`subscriptions_${telegramId}`);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 5 * 60 * 1000) { // 5 minutes cache
            console.log("📦 Using cached subscriptions");
            setSubscriptions(data);
            return;
          }
        }

        // Fetch logic would go here
        // For now, we're just implementing the caching part

      } catch (error) {
        console.error('❌ Failed to fetch subscriptions:', error);
      }
    };

    fetchSubscriptions();
    const interval = setInterval(fetchSubscriptions, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [telegramId, setSubscriptions]);

  // Prefetch important pages for better navigation experience
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

  // Minimum delay for splash screen
  useEffect(() => {
    const timer = setTimeout(() => setMinDelayCompleted(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Update wallet address in store when available
  useEffect(() => {
    if (walletAddress) {
      setWalletAddress(walletAddress);
    }
  }, [walletAddress, setWalletAddress]);

  const isDataLoaded = minDelayCompleted && !isWalletLoading;
  const hasError = isWalletError;

  if (!isDataLoaded) return <SplashScreen />;

  if (hasError) {
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
      <QueryClientProvider client={queryClient}>
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