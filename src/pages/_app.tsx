// src/pages/_app.tsx
'use client'
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
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
import { readStartAppParam, resolveTargetRoute } from '@/lib/startapp'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

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
})

// ---- Hook: عنوان محفظة البوت ----
const useWalletAddress = () =>
  useQuery({
    queryKey: ['walletAddress'],
    queryFn: fetchBotWalletAddress,
    retry: 3,
    staleTime: 15 * 60 * 1000,
  })

// صفحات نفضّل فيها وجود الفوتر (احتياطي لو الصفحة ما حدّدت hideFooter)
const TOP_LEVEL_ALLOWLIST = ['/', '/shop', '/profile', '/plans', '/notifications']

const useNavigationProgress = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleStart = () => setIsNavigating(true);
    const handleComplete = () => setTimeout(() => setIsNavigating(false), 300);
    const handleError = () => setIsNavigating(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleError);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleError);
    };
  }, [router]);

  return isNavigating;
};

function AppContent({ children, hideFooter }: { children: React.ReactNode; hideFooter?: boolean }) {
  const [minDelayCompleted, setMinDelayCompleted] = useState(false)
  const { setSubscriptions } = useProfileStore()
  const { isTelegramApp, isTelegramReady, isLoading: isTelegramLoading, telegramId } = useTelegram()
  const { setWalletAddress } = useTariffStore()
  const router = useRouter()
  const asPath = router.asPath
  const pathnameNoQuery = useMemo(() => asPath.split('?')[0], [asPath])
  const queryClient = useTanstackQueryClient()
  const didRouteRef = useRef(false)
  const isNavigating = useNavigationProgress()

  // إشعارات عبر SSE
  useNotificationStream()

  // سبلاش (حد أدنى 1.5 ثانية)
  useEffect(() => {
    const t = setTimeout(() => setMinDelayCompleted(true), 1500)
    return () => clearTimeout(t)
  }, [])

  // جلب المحفظة
  const { data: walletAddress, isLoading: isWalletLoading, isError: isWalletError, error: walletError } = useWalletAddress()

  useEffect(() => {
    if (walletAddress) setWalletAddress(walletAddress)
  }, [walletAddress, setWalletAddress])

  // الاشتراكات (كاش محلي)
  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!telegramId) return
      try {
        const cached = localStorage.getItem(`subscriptions_${telegramId}`)
        if (cached) {
          const { data, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            setSubscriptions(data)
            return
          }
        }
      } catch (e) {
        console.error(`❌ Failed to load subscriptions for ${telegramId}:`, e)
      }
    }
    fetchSubscriptions()
    const interval = setInterval(fetchSubscriptions, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [telegramId, setSubscriptions])

  // Prefetch صفحات مهمة (ثابت لتجنّب إعادة إنشاء المصفوفة)
  useEffect(() => {
    const pagesToPrefetch = TOP_LEVEL_ALLOWLIST
    Promise.all(pagesToPrefetch.map((p) => router.prefetch(p))).catch((e) => console.warn('Prefetch error:', e))
  }, [router])

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    const isSecureContext = window.location.protocol === 'https:' || window.location.hostname === 'localhost'
    if (!isSecureContext) return

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        }
      } catch (error) {
        console.warn('[PWA] Service worker registration failed:', error)
      }
    }

    register()
  }, [])

  // شرط السبلاتش
  const showSplashScreen =
    !minDelayCompleted ||
    isWalletLoading ||
    isTelegramLoading ||
    (isTelegramApp && !isTelegramReady)

  // ======= توجيه startapp بعد الجاهزية =======
  useEffect(() => {
    if (didRouteRef.current) return
    const ready = !showSplashScreen && (!isTelegramApp || isTelegramReady)
    if (!ready) return

    const raw = readStartAppParam()
    if (!raw) return

    const target = resolveTargetRoute(raw)
    if (!target) return

    if (pathnameNoQuery === target.split('?')[0]) {
      didRouteRef.current = true
      return
    }

    didRouteRef.current = true
    router.replace(target).catch(console.error)

    try {
      const cleanUrl = window.location.pathname
      window.history.replaceState({}, '', cleanUrl)
    } catch {}
  }, [isTelegramApp, isTelegramReady, showSplashScreen, router, pathnameNoQuery])

  // ======= تحسينات الحركة =======
  const prefersReduced = useReducedMotion()
  const isRTL = useMemo(() => {
    if (typeof document === 'undefined') return true
    return document.dir?.toLowerCase() === 'rtl'
  }, [])
  
  const enterX = isRTL ? 40 : -40
  const exitX = isRTL ? -20 : 20

  // إعدادات الحركة المحسنة
  const motionVariants = {
    initial: { 
      opacity: 0, 
      x: prefersReduced ? 0 : enterX,
      filter: prefersReduced ? 'none' : 'blur(4px)'
    },
    animate: { 
      opacity: 1, 
      x: 0,
      filter: 'blur(0px)',
      transition: {
        duration: prefersReduced ? 0 : 0.25,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: { 
      opacity: 0, 
      x: prefersReduced ? 0 : exitX,
      filter: prefersReduced ? 'none' : 'blur(4px)',
      transition: {
        duration: prefersReduced ? 0 : 0.2,
        ease: [0.4, 0, 1, 1]
      }
    }
  };

  // إعادة التمرير إلى الأعلى بعد التنقل
  useEffect(() => {
    const handleDone = () => {
      try {
        window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'instant' as ScrollBehavior })
        setTimeout(() => {
          const main = document.getElementById('app-main')
          main?.setAttribute('tabindex', '-1')
          main?.focus({ preventScroll: true })
        }, 100)
      } catch {}
    }
    router.events.on('routeChangeComplete', handleDone)
    return () => {
      router.events.off('routeChangeComplete', handleDone)
    }
  }, [router.events, prefersReduced])

  // منطق الفوتر
  const showFooter = useMemo(() => {
    if (hideFooter) return false
    if (TOP_LEVEL_ALLOWLIST.includes(pathnameNoQuery)) return true
    if (pathnameNoQuery.startsWith('/shop/') && pathnameNoQuery !== '/shop') return false
    return false
  }, [hideFooter, pathnameNoQuery])

  // معالجة إعادة المحاولة
  const handleRetryWallet = useCallback(() => {
    queryClient.refetchQueries({ queryKey: ['walletAddress'] })
  }, [queryClient])

  if (showSplashScreen) return <SplashScreen />

  if (isWalletError) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center px-4 text-red-500">
        <p className="mb-2">حدث خطأ أثناء تحميل بيانات المحفظة.</p>
        {process.env.NODE_ENV === 'development' && (
          <p className="text-xs text-gray-400 mb-4">
            {(walletError as Error)?.message || String(walletError)}
          </p>
        )}
        <button
          onClick={handleRetryWallet}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    )
  }

  return (
    <>
      {/* مؤشر التقدم أثناء التنقل */}
      
      
      <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
        <motion.main
          id="app-main"
          key={asPath}
          variants={motionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={showFooter ? 'pb-16' : ''}
          style={{ 
            willChange: prefersReduced ? 'auto' : 'transform, opacity'
          }}
          role="main"
          aria-live="polite"
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {showFooter && <FooterNav />}
      <NotificationToast />
    </>
  )
}
// ===================== MyApp =====================
function MyApp({ Component, pageProps }: AppProps) {
  const hideFooter = Boolean((Component as any).hideFooter)

  return (
    <TelegramProvider>
      <QueryClientProvider client={globalQueryClient}>
        <NotificationsProvider>
          <AppContent hideFooter={hideFooter}>
            <Component {...pageProps} />
          </AppContent>
          <ReactQueryDevtools initialIsOpen={false} />
        </NotificationsProvider>
      </QueryClientProvider>
    </TelegramProvider>
  )
}

export default MyApp
