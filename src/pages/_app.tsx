// _app.tsx
'use client'
import React, { useEffect, useRef, useState } from 'react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import '../styles/globals.css'
import FooterNav from '../components/FooterNav'
import SplashScreen from '../components/SplashScreen'
import SubscriptionStatusListener from '../components/SubscriptionStatusListener'
import InviteAlert from '../components/InviteAlert'
import { TelegramProvider, useTelegram } from '../context/TelegramContext'
import { useProfileStore } from '../stores/profileStore'
import { useTariffStore } from '../stores/zustand'
import { fetchBotWalletAddress, getUserData } from '../services/api'
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'

const queryClient = new QueryClient()

// Hook لجلب عنوان المحفظة باستخدام React Query
const useWalletAddress = () => {
  return useQuery('walletAddress', fetchBotWalletAddress, {
    retry: 3,
    refetchOnWindowFocus: false,
  })
}

// Hook لجلب بيانات المستخدم من تليجرام باستخدام React Query
const useTelegramUserData = (telegramId: string) => {
  return useQuery(['userData', telegramId], () => getUserData(telegramId), {
    enabled: !!telegramId,
    retry: 3,
    refetchOnWindowFocus: false,
  })
}

function AppContent({ Component, pageProps, router }: AppProps) {
  const isClient = useRef(false)
  const [minDelayCompleted, setMinDelayCompleted] = useState(false)

  useEffect(() => {
    isClient.current = true
    if (typeof window !== 'undefined') {
      console.log("AppContent (Client-side): Checking window.Telegram:", window.Telegram)
    }
    const timer = setTimeout(() => setMinDelayCompleted(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  const nextRouter = useRouter()
  const { telegramId } = useTelegram()
  const { setUserProfile, setUserSubscriptions } = useProfileStore()
  const { setWalletAddress } = useTariffStore()

  const { data: walletAddress, isLoading: isWalletLoading, isError: isWalletError, error: walletError } = useWalletAddress()
  const { data: userData, isLoading: isUserLoading, isError: isUserError, error: userError } = useTelegramUserData(telegramId || '')

  // تحديث Zustand عند جلب عنوان المحفظة
  useEffect(() => {
    if (walletAddress) {
      setWalletAddress(walletAddress)
    }
  }, [walletAddress, setWalletAddress])

  // تحديث Zustand عند جلب بيانات المستخدم
  useEffect(() => {
    if (userData) {
      setUserProfile(userData)
      setUserSubscriptions(userData.subscriptions || [])
    }
  }, [userData, setUserProfile, setUserSubscriptions])

  // جلب الصفحات مسبقاً لتسريع التنقل
  useEffect(() => {
    const prefetchPages = async () => {
      try {
        await Promise.all([
          nextRouter.prefetch('/'),
          nextRouter.prefetch('/plans'),
          nextRouter.prefetch('/profile'),
        ])
        console.log('✅ جميع الصفحات تم تحميلها مسبقًا.')
      } catch (error) {
        console.error('⚠️ خطأ أثناء تحميل الصفحات:', error)
      }
    }
    prefetchPages()
  }, [nextRouter])

  const isDataLoaded = minDelayCompleted && !isWalletLoading && !isUserLoading
  const hasError = isWalletError || isUserError
  const errorState = walletError || userError

  if (!isDataLoaded) {
    return <SplashScreen />
  }

  if (hasError) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-center px-4">
        <p>❌ حدث خطأ أثناء تحميل البيانات: {errorState?.toString()}</p>
      </div>
    )
  }

  return (
    <>
      <Component {...pageProps} router={router} />
      <FooterNav />
      {/* مكون WebSocket الذي يحدّث Local Storage عند وصول بيانات الاشتراك */}
      <SubscriptionStatusListener />
      {/* مكون التنبيه (Alert) الذي يعرض إشعار الدفع ورابط الدعوة */}
      <InviteAlert />
    </>
  )
}

function MyApp({ Component, pageProps, router }: AppProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log("MyApp (Client-side): Checking window.Telegram:", window.Telegram)
    }
  }, [])

  return (
    <TelegramProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent Component={Component} pageProps={pageProps} router={router} />
      </QueryClientProvider>
    </TelegramProvider>
  )
}

export default MyApp
