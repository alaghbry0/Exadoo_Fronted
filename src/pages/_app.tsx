'use client'
import { useState, useEffect, useCallback } from 'react'
import type { AppProps } from 'next/app'
import '../styles/globals.css'
import FooterNav from '../components/FooterNav'
import SplashScreen from '../components/SplashScreen'
import { motion } from 'framer-motion'
import { TelegramProvider, useTelegram } from '../context/TelegramContext'

function AppContent({ Component, pageProps, router }: AppProps) {
  const { telegramId, setTelegramId } = useTelegram()
  const [errorState, setErrorState] = useState<string | null>(null)
  const [isAppLoaded, setIsAppLoaded] = useState(false)
  const [cachedPages, setCachedPages] = useState<Record<string, string>>({}) // ✅ تحسين TypeScript

  // ✅ تحديد إذا كان التطبيق يعمل داخل تليجرام
  const isTelegramApp = typeof window !== 'undefined' && window.Telegram?.WebApp !== undefined

  const initializeTelegram = useCallback(() => {
    try {
      if (!isTelegramApp) {
        console.log("✅ التطبيق يعمل خارج Telegram WebApp")
        setErrorState(null) // لا تعرض أي رسالة خطأ
        setIsAppLoaded(true)
        return
      }

      window.Telegram.WebApp.ready()
      window.Telegram.WebApp.expand()
      console.log("✅ تم تهيئة Telegram WebApp بنجاح")

      const userId = window.Telegram.WebApp.initDataUnsafe?.user?.id?.toString() || null
      if (userId) {
        console.log("✅ telegram_id متاح:", userId)
        setTelegramId(userId)
        setErrorState(null) // إزالة أي رسائل خطأ سابقة
      } else {
        console.warn("⚠️ لم يتم العثور على معرف Telegram.")
        setErrorState(isTelegramApp ? "⚠️ لم يتم العثور على معرف Telegram. يرجى المحاولة مرة أخرى." : null)
      }
    } catch (error) {
      console.error("❌ خطأ أثناء تهيئة Telegram WebApp:", error)
      setErrorState(isTelegramApp ? "❌ حدث خطأ أثناء تحميل Telegram WebApp." : null)
    }
  }, [setTelegramId, isTelegramApp])

  useEffect(() => {
    if (!isTelegramApp) {
      setIsAppLoaded(true) // ✅ لا تحاول تحميل `telegramId` إذا كان التطبيق خارج تليجرام
      return
    }

    let attempts = 0
    const maxAttempts = 5
    let retryTimeout: NodeJS.Timeout | null = null

    const retryFetch = () => {
      if (telegramId) {
        console.log("✅ تم العثور على telegram_id، إيقاف المحاولات.")
        if (retryTimeout) clearTimeout(retryTimeout)
        setIsAppLoaded(true)
        return
      }

      if (attempts >= maxAttempts) {
        console.error("❌ تعذر استرداد بيانات تيليجرام بعد عدة محاولات.")
        setErrorState("❌ تعذر استرداد بيانات تيليجرام بعد عدة محاولات.")
        setIsAppLoaded(true)
        return
      }

      console.warn(`⚠️ المحاولة رقم ${attempts + 1} للحصول على telegram_id...`)
      initializeTelegram()
      attempts++
      retryTimeout = setTimeout(retryFetch, 2000)
    }

    retryFetch()

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout)
    }
  }, [telegramId, initializeTelegram, isTelegramApp])

  // ✅ تحميل جميع الصفحات مسبقًا وتخزينها في الذاكرة المؤقتة
  useEffect(() => {
    const prefetchPages = async () => {
      const pages = ['/', '/plans', '/profile']
      for (const page of pages) {
        if (!cachedPages[page]) {
          try {
            const res = await fetch(page)
            if (!res.ok) {
              console.warn(`⚠️ تجاهل تحميل الصفحة: ${page}, الحالة: ${res.status}`)
              continue
            }
            const data = await res.text()
            setCachedPages(prev => ({ ...prev, [page]: data }))
            console.log(`✅ تم تحميل الصفحة مسبقًا: ${page}`)
          } catch (error) {
            console.warn(`⚠️ خطأ أثناء تحميل الصفحة: ${page}, السبب:`, error)
          }
        }
      }
    }

    if (isAppLoaded) {
      prefetchPages()
    }
  }, [isAppLoaded, cachedPages])

  return !isAppLoaded ? (
    <SplashScreen />
  ) : (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {errorState ? (
        <div className="flex justify-center items-center h-screen text-red-500 text-center px-4">
          <p>{errorState}</p>
        </div>
      ) : (
        <>
          <Component {...pageProps} router={router} />
          <FooterNav />
        </>
      )}
    </motion.div>
  )
}

function MyApp({ Component, pageProps, router }: AppProps) {
  return (
    <TelegramProvider>
      <AppContent Component={Component} pageProps={pageProps} router={router} />
    </TelegramProvider>
  )
}

export default MyApp
