'use client'
import { useState, useEffect } from 'react'
import type { AppProps } from 'next/app'
import '../styles/globals.css'
import FooterNav from '../components/FooterNav'
import SplashScreen from '../components/SplashScreen'
import { motion } from 'framer-motion'
import { TelegramProvider, useTelegram } from '../context/TelegramContext'

function AppContent({ Component, pageProps, router }: AppProps) {
  const { telegramId } = useTelegram()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (telegramId) {
        console.log("✅ telegram_id متاح:", telegramId)
        setIsLoading(false)
      } else {
        console.warn("⚠️ لا يوجد telegram_id، التطبيق ينتظر البيانات...")
        const timeout = setTimeout(() => {
          setIsLoading(false)
        }, 3000)

        return () => clearTimeout(timeout)
      }
    }

    checkData()
  }, [telegramId])

  return (
    isLoading ? (
      <SplashScreen />
    ) : (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
        <Component {...pageProps} router={router} />
        <FooterNav />
      </motion.div>
    )
  )
}

function MyApp({ Component, pageProps, router }: AppProps) {
  const [isTelegramReady, setIsTelegramReady] = useState(false)

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready()
      window.Telegram.WebApp.expand()
      setIsTelegramReady(true)
    }
  }, [])

  return (
    <TelegramProvider>
      {isTelegramReady ? (
        <AppContent Component={Component} pageProps={pageProps} router={router} />
      ) : (
        <SplashScreen />
      )}
    </TelegramProvider>
  )
}

export default MyApp