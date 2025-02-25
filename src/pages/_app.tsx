// _app.tsx
'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import '../styles/globals.css'
import FooterNav from '../components/FooterNav'
import SplashScreen from '../components/SplashScreen'
import { motion } from 'framer-motion'
import { TelegramProvider, useTelegram } from '../context/TelegramContext'
import { useProfileStore } from '../stores/profileStore'

// استيراد React Query
import { QueryClient, QueryClientProvider } from 'react-query'
import { getUserData } from '../services/api'

const queryClient = new QueryClient();

function AppContent({ Component, pageProps, router }: AppProps) {
  const isClient = useRef(false);
  useEffect(() => {
    isClient.current = true;
    if (typeof window !== 'undefined') {
      console.log("AppContent (Client-side): Checking window.Telegram:", window.Telegram);
    }
  }, []);

  const [errorState, setErrorState] = useState<string | null>(null);
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const [pagesLoaded, setPagesLoaded] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const nextRouter = useRouter();
  const { telegramId } = useTelegram();
  const { setUserProfile, setUserSubscriptions } = useProfileStore();

  // تحميل الصفحات مسبقًا
  const prefetchPages = useCallback(async () => {
    try {
      await Promise.all([
        nextRouter.prefetch('/'),
        nextRouter.prefetch('/plans'),
        nextRouter.prefetch('/profile'),
      ]);
      console.log('✅ جميع الصفحات تم تحميلها مسبقًا.');
      setPagesLoaded(true);
    } catch (error) {
      console.error('⚠️ خطأ أثناء تحميل الصفحات:', error);
    }
  }, [nextRouter]);

  // تحميل بيانات المستخدم من API
  const prefetchUserData = useCallback(async () => {
    console.log('🔄 بدء تحميل بيانات المستخدم في _app.tsx');
    if (telegramId) {
      try {
        const userData = await getUserData(telegramId);
        console.log('✅ تم جلب بيانات المستخدم بنجاح:', userData);
        setUserProfile(userData);
        setUserSubscriptions(userData.subscriptions || []);
        setDataLoaded(true);
      } catch (error) {
        console.error('❌ خطأ أثناء جلب بيانات المستخدم:', error);
        setErrorState('❌ حدث خطأ أثناء تحميل بيانات المستخدم.');
        setDataLoaded(false);
      }
    } else {
      console.log('⚠️ لم يتم العثور على telegramId، تخطي تحميل بيانات المستخدم.');
      setDataLoaded(true);
    }
  }, [telegramId, setUserProfile, setUserSubscriptions]);

  const initializeApp = useCallback(async () => {
    try {
      await Promise.all([prefetchPages(), prefetchUserData()]);
      console.log('✅ تم تحميل جميع البيانات الأساسية.');
    } catch (error) {
      console.error('❌ خطأ أثناء تهيئة التطبيق:', error);
      setErrorState('❌ حدث خطأ أثناء تحميل التطبيق.');
    }
  }, [prefetchPages, prefetchUserData]);

  useEffect(() => {
    const init = async () => {
      await initializeApp();
      setTimeout(() => {
        if (pagesLoaded && dataLoaded) {
          setIsAppLoaded(true);
        }
      }, 3000);
    };
    init();
  }, [initializeApp, pagesLoaded, dataLoaded]);

  let content;
  if (!isAppLoaded) {
    content = <SplashScreen />;
  } else {
    content = (
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
    );
  }

  return <>{content}</>;
}

function MyApp({ Component, pageProps, router }: AppProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log("MyApp (Client-side): Checking window.Telegram:", window.Telegram);
    }
  }, []);

  return (
    <TelegramProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent Component={Component} pageProps={pageProps} router={router} />
      </QueryClientProvider>
    </TelegramProvider>
  );
}

export default MyApp;
