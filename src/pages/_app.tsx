'use client'
import { useState, useEffect, useCallback } from 'react'
import type { AppProps } from 'next/app'
import '../styles/globals.css'
import FooterNav from '../components/FooterNav'
import SplashScreen from '../components/SplashScreen'
import { motion } from 'framer-motion'
import { TelegramProvider, useTelegram } from '../context/TelegramContext'

function AppContent({ Component, pageProps, router }: AppProps) {
  const { telegramId } = useTelegram()
  const [isLoading, setIsLoading] = useState(true)
  const [errorState, setErrorState] = useState<string | null>(null)

  // ✅ تحسين التحقق من Telegram WebApp وإضافة try-catch لمنع الأعطال
  const initializeTelegram = useCallback(() => {
    try {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready()
        window.Telegram.WebApp.expand()
        console.log("✅ تم تهيئة Telegram WebApp بنجاح")
      } else {
        console.warn("⚠️ Telegram WebApp غير متوفر")
        setErrorState("⚠️ يرجى فتح التطبيق داخل تليجرام.")
      }
    } catch (error) {
      console.error("❌ خطأ أثناء تهيئة Telegram WebApp:", error)
      setErrorState("❌ حدث خطأ أثناء تحميل Telegram WebApp.")
    }
  }, [])

  useEffect(() => {
    initializeTelegram()

    const checkData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (telegramId) {
        console.log("✅ telegram_id متاح:", telegramId)
        setIsLoading(false)
      } else {
        console.warn("⚠️ لا يوجد telegram_id، التطبيق ينتظر البيانات...")
        setTimeout(() => setIsLoading(false), 3000)
      }
    }

    checkData()
  }, [telegramId, initializeTelegram])

  return isLoading ? (
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
