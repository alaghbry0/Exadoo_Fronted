// _app.tsx
'use client'
import React, { useEffect, useState } from 'react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import '../styles/globals.css'
import FooterNav from '../components/FooterNav'
import SplashScreen from '../components/SplashScreen'
import InviteAlert from '../components/InviteAlert'
import { TelegramProvider, useTelegram } from '../context/TelegramContext'
import { useTariffStore } from '../stores/zustand'
import { fetchBotWalletAddress } from '../services/api'
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import { useProfileStore } from '../stores/profileStore' // تأكد من وجود هذا المسار

const queryClient = new QueryClient()

const useWalletAddress = () => {
  return useQuery('walletAddress', fetchBotWalletAddress, {
    retry: 3,
    refetchOnWindowFocus: false,
  })
}

function AppContent({ Component, pageProps, router }: AppProps) {
  const [minDelayCompleted, setMinDelayCompleted] = useState(false)
  const { setSubscriptions } = useProfileStore()
  const { telegramId } = useTelegram()
  const { setWalletAddress } = useTariffStore()
  const nextRouter = useRouter()

  const {
    data: walletAddress,
    isLoading: isWalletLoading,
    isError: isWalletError,
    error: walletError
  } = useWalletAddress()

  // إصلاح بنية useEffect لجلب الاشتراكات
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

        // إضافة منطق جلب البيانات من الخادم هنا
        // const freshData = await fetchSubscriptionsFromServer()
        // localStorage.setItem('subscriptions', JSON.stringify({
        //   data: freshData,
        //   timestamp: Date.now()
        // }))
      } catch (error) {
        console.error('فشل في جلب الاشتراكات:', error)
      }
    }

    fetchSubscriptions()
    const interval = setInterval(fetchSubscriptions, 300000)
    return () => clearInterval(interval)
  }, [telegramId, setSubscriptions])

  // إصلاح المسافة البيضاء الزائدة
  useEffect(() => {
    const prefetchPages = async () => {
      try {
        await nextRouter.prefetch('/')
        await nextRouter.prefetch('/plans')
        await nextRouter.prefetch('/profile')
      } catch (error) {
        console.error('⚠️ خطأ أثناء التحميل المسبق:', error)
      }
    }
    prefetchPages()
  }, [nextRouter])

  useEffect(() => {
    const timer = setTimeout(() => setMinDelayCompleted(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  // تحديث عنوان المحفظة عند التحميل
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
      <Component {...pageProps} router={router} />
      <FooterNav />
      <InviteAlert />
    </>
  )
}

function MyApp({ Component, pageProps, router }: AppProps) {
  return (
    <TelegramProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent Component={Component} pageProps={pageProps} router={router} />
      </QueryClientProvider>
    </TelegramProvider>
  )
}

export default MyApp