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
    if (telegramId) return; // ✅ إيقاف إعادة المحاولة عند توفر `telegramId`

    let attempts = 0;
    const maxAttempts = 5;
    let retryTimeout: NodeJS.Timeout | null = null;

    const retryFetch = () => {
      if (telegramId) {
        console.log("✅ تم العثور على telegram_id، إيقاف المحاولات.");
        if (retryTimeout) clearTimeout(retryTimeout);
        return;
      }

      if (attempts >= maxAttempts) {
        console.error("❌ تعذر استرداد بيانات تيليجرام بعد عدة محاولات.");
        setErrorState("❌ تعذر استرداد بيانات تيليجرام بعد عدة محاولات.");
        return;
      }

      console.warn(`⚠️ المحاولة رقم ${attempts + 1} للحصول على telegram_id...`);
      initializeTelegram();
      attempts++;
      retryTimeout = setTimeout(retryFetch, 2000);
    };

    retryFetch();

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [telegramId, initializeTelegram]);

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
