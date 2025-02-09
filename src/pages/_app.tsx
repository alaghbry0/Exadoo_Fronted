// _app.tsx
'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import type { AppProps } from 'next/app'
import { useRouter, Router } from 'next/router'
import '../styles/globals.css'
import FooterNav from '../components/FooterNav'
import SplashScreen from '../components/SplashScreen'
import { motion } from 'framer-motion'
import { TelegramProvider } from '../context/TelegramContext'
import { useTelegram } from '../context/TelegramContext'
import React from 'react'

interface AppContentProps extends AppProps {
    router: Router;
}

export function AppContent({ Component, pageProps, router }: AppContentProps) {
    // ✅ فحص window.Telegram و webApp من السياق في بداية AppContent (جانب العميل فقط)
    const isClient = useRef(false);
    useEffect(() => {
        isClient.current = true;
        if (typeof window !== 'undefined') {
            console.log("AppContent (Client-side): Checking window.Telegram (at start):", window.Telegram);
            console.log("AppContent (Client-side): Checking window.Telegram.WebApp (at start):", window.Telegram?.WebApp);
        }
    }, []);


    const { telegramId } = useTelegram();
    const [errorState, setErrorState] = useState<string | null>(null);
    const [isAppLoaded, setIsAppLoaded] = useState(false);
    const [pagesLoaded, setPagesLoaded] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const nextRouter = useRouter();

    // ✅ مسح sessionStorage فقط عند تغيير telegramId إلى قيمة مختلفة
    const previousTelegramId = useRef<string | null>(telegramId); // useRef لتتبع القيمة السابقة
    useEffect(() => {
        if (telegramId !== previousTelegramId.current) { // ✅ تحقق من تغيير القيمة
            sessionStorage.clear();
            console.log('✅ sessionStorage تم مسحه بسبب تغيير telegramId');
            previousTelegramId.current = telegramId; // تحديث القيمة السابقة
        }
    }, [telegramId]);


    // ✅ تحميل جميع الصفحات مسبقًا عند فتح التطبيق
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

    // ✅ تحميل بيانات المستخدم أثناء شاشة التحميل (تم تعديله ليناسب التغييرات في profile.tsx)
    const prefetchUserData = useCallback(async () => {
        setDataLoaded(true);
        console.log(
            '✅ تم تخطي تحميل بيانات المستخدم مسبقًا في _app.tsx. يتم جلبه مباشرة في صفحة الملف الشخصي.'
        );
    }, []);

    // ✅ تهيئة التطبيق وتحميل البيانات الأساسية
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
            }, 6000);
        }
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

    return (
        <React.Fragment>
            {content}
        </React.Fragment>
    );
}

function MyApp({ Component, pageProps, router }: AppProps) {
    // ✅ فحص window.Telegram و webApp من السياق في بداية MyApp (جانب العميل فقط)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            console.log("MyApp (Client-side): Checking window.Telegram (before TelegramProvider):", window.Telegram);
            console.log("MyApp (Client-side): Checking window.Telegram.WebApp (before TelegramProvider):", window.Telegram?.WebApp);
        }
    }, []);


    return (
        <TelegramProvider>
            <AppContent Component={Component} pageProps={pageProps} router={router} />
        </TelegramProvider>
    );
}

export default MyApp