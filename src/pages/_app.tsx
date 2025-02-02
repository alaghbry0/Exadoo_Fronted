'use client'
import { useState, useEffect } from 'react'
import type { AppProps } from 'next/app'
import '../styles/globals.css'
import FooterNav from '../components/FooterNav'
import SplashScreen from '../components/SplashScreen'
import { motion } from 'framer-motion'
import { TelegramProvider, useTelegram } from '../context/TelegramContext'

function AppContent({ Component, pageProps, router }: AppProps) {
  const { telegramId } = useTelegram(); // جلب telegram_id من السياق
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkData = async () => {
      // انتظر لمدة ثانية لمحاكاة تحميل البيانات
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (telegramId) {
        console.log("✅ telegram_id متاح:", telegramId);
        setIsLoading(false); // إخفاء شاشة التحميل بعد التأكد من وجود telegram_id
      } else {
        console.warn("⚠️ لا يوجد telegram_id، التطبيق ينتظر البيانات...");
        // إذا لم يتم العثور على telegram_id بعد 3 ثوانٍ، تخطّى شاشة التحميل
        const timeout = setTimeout(() => {
          setIsLoading(false);
        }, 3000);

        return () => clearTimeout(timeout); // تنظيف الـ timeout عند إلغاء المكون
      }
    };

    checkData();
  }, [telegramId]); // يعاد التشغيل عند تغيير telegram_id

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
        <Component {...pageProps} router={router} /> {/* تمرير router */}
        <FooterNav />
      </motion.div>
    )
  );
}

function MyApp({ Component, pageProps, router }: AppProps) {
  return (
    <TelegramProvider> {/* جعل telegram_id متاحًا في جميع الصفحات */}
      <AppContent Component={Component} pageProps={pageProps} router={router} />
    </TelegramProvider>
  );
}

export default MyApp;