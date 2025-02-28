
// _app.tsx
'use client'
import React, { useEffect, useRef } from 'react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import '../styles/globals.css'
import FooterNav from '../components/FooterNav'
import SplashScreen from '../components/SplashScreen'

import { TelegramProvider, useTelegram } from '../context/TelegramContext'
import { useProfileStore } from '../stores/profileStore'
import { useTariffStore } from '../stores/zustand'
import { fetchBotWalletAddress, getUserData } from '../services/api'
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'

const queryClient = new QueryClient()

// إنشاء hook لجلب عنوان المحفظة باستخدام React Query
const useWalletAddress = () => {
  return useQuery('walletAddress', fetchBotWalletAddress, {
    retry: 3, // إعادة المحاولة ثلاث مرات في حالة الفشل
    refetchOnWindowFocus: false,
  })
}

// إنشاء hook لجلب بيانات المستخدم من تليجرام باستخدام React Query
const useTelegramUserData = (telegramId: string) => {
  return useQuery(['userData', telegramId], () => getUserData(telegramId), {
    enabled: !!telegramId, // تشغيل الكويري فقط إذا كان telegramId موجودًا
    retry: 3,
    refetchOnWindowFocus: false,
  })
}

function AppContent({ Component, pageProps, router }: AppProps) {
  const isClient = useRef(false)
  useEffect(() => {
    isClient.current = true
    if (typeof window !== 'undefined') {
      console.log("AppContent (Client-side): Checking window.Telegram:", window.Telegram)
    }
  }, [])

  const nextRouter = useRouter()
  const { telegramId } = useTelegram()
  const { setUserProfile, setUserSubscriptions } = useProfileStore()
  const { setWalletAddress } = useTariffStore()

  // استخدام React Query لجلب عنوان المحفظة
  const {
    data: walletAddress,
    isLoading: isWalletLoading,
    isError: isWalletError,
    error: walletError,
  } = useWalletAddress()

  // استخدام React Query لجلب بيانات المستخدم
  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useTelegramUserData(telegramId || '')

  // تحديث Zustand بمجرد نجاح جلب عنوان المحفظة
  useEffect(() => {
    if (walletAddress) {
      setWalletAddress(walletAddress)
    }
  }, [walletAddress, setWalletAddress])

  // تحديث Zustand بمجرد نجاح جلب بيانات المستخدم
  useEffect(() => {
    if (userData) {
      setUserProfile(userData)
      setUserSubscriptions(userData.subscriptions || [])
    }
  }, [userData, setUserProfile, setUserSubscriptions])

  // جلب الصفحات مسبقًا
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

  // تحديد ما إذا كانت البيانات جاهزة
  const isDataLoaded = !isWalletLoading && !isUserLoading
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
