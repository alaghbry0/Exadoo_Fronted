'use client'
import { useState, useEffect, useCallback } from 'react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import '../styles/globals.css'
import FooterNav from '../components/FooterNav'
import SplashScreen from '../components/SplashScreen'
import { motion } from 'framer-motion'
import { TelegramProvider, useTelegram } from '../context/TelegramContext'

function AppContent({ Component, pageProps, router }: AppProps) {
  const { telegramId, setTelegramId, isTelegramReady } = useTelegram()
  const [errorState, setErrorState] = useState<string | null>(null)
  const [isAppLoaded, setIsAppLoaded] = useState(false)
  const [pagesLoaded, setPagesLoaded] = useState(false)
  const nextRouter = useRouter()

  const isTelegramApp = typeof window !== 'undefined' && !!window.Telegram?.WebApp

  // ✅ تحميل جميع الصفحات مسبقًا عند فتح التطبيق
  const prefetchPages = useCallback(async () => {
    try {
      await Promise.all([
        nextRouter.prefetch('/'),
        nextRouter.prefetch('/plans'),
        nextRouter.prefetch('/profile')
      ])
      console.log("✅ جميع الصفحات تم تحميلها مسبقًا.")
      setPagesLoaded(true)
    } catch (error) {
      console.error("⚠️ خطأ أثناء تحميل الصفحات:", error)
    }
  }, [nextRouter])

  // ✅ تهيئة التطبيق وتحميل بيانات المستخدم
  const initializeApp = useCallback(async () => {
    try {
      await prefetchPages() // تحميل الصفحات مسبقًا

      if (isTelegramReady && telegramId) {
        console.log("✅ التطبيق جاهز داخل تليجرام")
        setIsAppLoaded(true)
        return
      }

      if (!isTelegramReady) {
        console.log("✅ التطبيق يعمل خارج تليجرام")
        setIsAppLoaded(true)
      }
    } catch (error) {
      console.error('❌ خطأ أثناء تهيئة التطبيق:', error)
      setErrorState('❌ حدث خطأ أثناء تحميل التطبيق.')
      setIsAppLoaded(true)
    }
  }, [isTelegramReady, telegramId, prefetchPages])

  useEffect(() => {
    const init = async () => {
      await initializeApp()

      // ✅ تأخير إخفاء شاشة التحميل حتى يتم تحميل كل شيء أو بعد 5 ثوانٍ كحد أقصى
      setTimeout(() => {
        if (pagesLoaded) {
          setIsAppLoaded(true)
        }
      }, 5000)
    }
    init()
  }, [initializeApp, pagesLoaded])

  return (
    <>
      {!isAppLoaded && <SplashScreen isAppLoaded={isAppLoaded} />}

      {isAppLoaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
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
      )}
    </>
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
