'use client'
import { useState, useEffect } from 'react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import '../styles/globals.css'
import FooterNav from '../components/FooterNav'
import SplashScreen from '../components/SplashScreen'
import { motion } from 'framer-motion'
import { TelegramProvider, useTelegram } from '../context/TelegramContext' // ✅ استيراد `TelegramProvider`

function AppContent({ Component, pageProps, router }: AppProps) {
  const { telegramId } = useTelegram(); // ✅ جلب `telegram_id`
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // ⏳ محاكاة تحميل البيانات
      if (telegramId) {
        console.log("✅ `telegram_id` متاح:", telegramId);
        setIsLoading(false); // 🚀 إخفاء شاشة التحميل بعد التأكد من `telegram_id`
      } else {
        console.warn("⚠️ لا يوجد `telegram_id`، التطبيق ينتظر البيانات...");
      }
    };

    checkData();
  }, [telegramId]); // 🔁 يتم التحقق عند تغيير `telegram_id`

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
        <Component {...pageProps} router={router} /> {/* ✅ تمرير `router` */}
        <FooterNav />
      </motion.div>
    )
  );
}

function MyApp({ Component, pageProps, router }: AppProps) {
  return (
    <TelegramProvider> {/* ✅ جعل `telegram_id` متاحًا في جميع الصفحات */}
      <AppContent Component={Component} pageProps={pageProps} router={router} />
    </TelegramProvider>
  );
}

export default MyApp;
