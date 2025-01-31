'use client'
import { useState, useEffect } from 'react'
import type { AppProps } from 'next/app'
import '../styles/globals.css'
import FooterNav from '../components/FooterNav'
import SplashScreen from '../components/SplashScreen'
import { motion } from 'framer-motion'

function MyApp({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // هنا يجب أن تضع كود تحميل البيانات الفعلية
    const fetchData = async () => {
      // مثال: جلب بيانات المستخدم أو الاشتراكات من API
      await new Promise((resolve) => setTimeout(resolve, 2500)) // محاكاة تحميل البيانات
      setIsLoading(false) // إخفاء شاشة الانتظار بعد اكتمال تحميل البيانات
    }

    fetchData()
  }, [])

  return (
    <>
      {isLoading ? (
        <SplashScreen />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <Component {...pageProps} />
          <FooterNav />
        </motion.div>
      )}
    </>
  )
}

export default MyApp
