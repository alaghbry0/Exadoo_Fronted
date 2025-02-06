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
  const { telegramId } = useTelegram()
  const [errorState, setErrorState] = useState<string | null>(null)
  const [isAppLoaded, setIsAppLoaded] = useState(false)
  const [pagesLoaded, setPagesLoaded] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false) // ✅ إضافة متغير جديد للتحقق من تحميل البيانات
  const nextRouter = useRouter()

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

  // ✅ تحميل بيانات المستخدم أثناء شاشة التحميل
  const prefetchUserData = useCallback(async () => {
    if (telegramId) {
      try {
        const cachedUserData = sessionStorage.getItem("userData")
        if (cachedUserData) {
          console.log("✅ استعادة بيانات المستخدم من `sessionStorage`")
          setDataLoaded(true)
          return JSON.parse(cachedUserData)
        }

        const res = await fetch(`/api/user?telegram_id=${telegramId}`)
        if (res.ok) {
          const data = await res.json()
          sessionStorage.setItem("userData", JSON.stringify(data)) // ✅ تخزين البيانات في `sessionStorage`
          console.log("✅ تم تحميل بيانات المستخدم مسبقًا.")
          setDataLoaded(true)
          return data
        } else {
          console.warn("⚠️ لم يتم العثور على بيانات المستخدم.")
        }
      } catch (error) {
        console.error("❌ خطأ أثناء تحميل بيانات المستخدم:", error)
      }
    }
    setDataLoaded(true) // ✅ حتى لا تنتظر الصفحة إلى ما لا نهاية
  }, [telegramId])

  // ✅ تهيئة التطبيق وتحميل البيانات الأساسية
  const initializeApp = useCallback(async () => {
    try {
      await Promise.all([prefetchPages(), prefetchUserData()])
      console.log("✅ تم تحميل جميع البيانات الأساسية.")
    } catch (error) {
      console.error("❌ خطأ أثناء تهيئة التطبيق:", error)
      setErrorState("❌ حدث خطأ أثناء تحميل التطبيق.")
    }
  }, [prefetchPages, prefetchUserData])

  useEffect(() => {
    const init = async () => {
      await initializeApp()

      // ✅ تأخير إخفاء شاشة التحميل حتى يتم تحميل كل شيء أو بعد 10 ثوانٍ كحد أقصى
      setTimeout(() => {
        if (pagesLoaded && dataLoaded) {
          setIsAppLoaded(true)
        }
      }, 6000)
    }
    init()
  }, [initializeApp, pagesLoaded, dataLoaded]) // ✅ ضمان تحميل البيانات قبل إخفاء شاشة التحميل

  return (
    <>
      {!isAppLoaded && <SplashScreen />} {/* ✅ ضمان ظهور شاشة التحميل عند فتح التطبيق */}

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
