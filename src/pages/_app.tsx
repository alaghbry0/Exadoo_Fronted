'use client'
import { useState, useEffect, useCallback } from 'react'
import type { AppProps } from 'next/app'
import '../styles/globals.css'
import FooterNav from '../components/FooterNav'
import SplashScreen from '../components/SplashScreen'
import { motion } from 'framer-motion'
import { TelegramProvider, useTelegram } from '../context/TelegramContext'

function AppContent({ Component, pageProps, router }: AppProps) {
  const { telegramId, isLoading, setTelegramId } = useTelegram()
  const [errorState, setErrorState] = useState<string | null>(null)

  // ✅ تحسين التحقق من Telegram WebApp وإضافة try-catch لمنع الأعطال
  const initializeTelegram = useCallback(() => {
    try {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready()
        window.Telegram.WebApp.expand()
        console.log("✅ تم تهيئة Telegram WebApp بنجاح")

        const userId = window.Telegram.WebApp.initDataUnsafe?.user?.id?.toString() || null
        if (userId) {
          console.log("✅ telegram_id متاح:", userId)
          setTelegramId(userId)
        } else {
          console.warn("⚠️ لم يتم العثور على معرف Telegram.")
          setErrorState("⚠️ لم يتم العثور على معرف Telegram. يرجى المحاولة مرة أخرى.")
        }
      } else {
        console.warn("⚠️ Telegram WebApp غير متوفر")
        setErrorState("⚠️ يرجى فتح التطبيق داخل تليجرام.")
      }
    } catch (error) {
      console.error("❌ خطأ أثناء تهيئة Telegram WebApp:", error)
      setErrorState("❌ حدث خطأ أثناء تحميل Telegram WebApp.")
    }
  }, [setTelegramId])

  useEffect(() => {
    initializeTelegram()

    if (telegramId) return // ✅ إذا كان `telegramId` متاحًا، لا داعي لإعادة المحاولة

    let attempts = 0
    const maxAttempts = 5
    let retryTimeout: NodeJS.Timeout

    const retryFetch = () => {
      if (!telegramId && attempts < maxAttempts) {
        console.warn(`⚠️ المحاولة رقم ${attempts + 1} للحصول على telegram_id...`)
        initializeTelegram()
        attempts++
        retryTimeout = setTimeout(retryFetch, 2000)
      } else if (!telegramId) {
        console.error("❌ فشل الحصول على معرف Telegram بعد عدة محاولات.")
        setErrorState("❌ تعذر استرداد بيانات تيليجرام بعد عدة محاولات.")
      }
    }

    retryTimeout = setTimeout(retryFetch, 2000)

    return () => clearTimeout(retryTimeout) // ✅ تنظيف `setTimeout` عند إلغاء التثبيت
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
