// _app.tsx
'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import type { AppProps } from 'next/app'
import { useRouter, Router } from 'next/router'
import '../styles/globals.css'
import FooterNav from '../components/FooterNav'
import SplashScreen from '../components/SplashScreen'
import { motion } from 'framer-motion'
import { TelegramProvider, useTelegram } from '../context/TelegramContext'
import React from 'react'
// import { useUserStore } from '../stores/zustand/userStore'; // ✅ تم حذف استيراد useUserStore غير المستخدم
import { useProfileStore } from '../stores/profileStore'; // ✅ استيراد profileStore
import { UserProfile } from '@/types'; // ✅ استيراد UserProfile type

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

    const [errorState, setErrorState] = useState<string | null>(null);
    const [isAppLoaded, setIsAppLoaded] = useState(false);
    const [pagesLoaded, setPagesLoaded] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const nextRouter = useRouter();
    const { telegramId } = useTelegram(); // ✅ استيراد telegramId من TelegramContext
    const { setUserProfile, setUserSubscriptions } = useProfileStore(); // ✅ استيراد setUserProfile و setUserSubscriptions من profileStore


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

    // ✅ تحميل بيانات المستخدم والاشتراكات أثناء شاشة التحميل (تم تعديله لجلب البيانات وتخزينها)
    const prefetchUserData = useCallback(async () => {
        console.log('🔄 بدء تحميل بيانات المستخدم والاشتراكات في _app.tsx');
        if (telegramId) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user?telegram_id=${telegramId}`);
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const userData = await res.json() as UserProfile;
                console.log('✅ تم جلب بيانات المستخدم والاشتراكات بنجاح في _app.tsx:', userData);

                // ✅ تخزين بيانات المستخدم والاشتراكات في Zustand Stores
                setUserProfile(userData); // تخزين بيانات الملف الشخصي في profileStore
                setUserSubscriptions(userData.subscriptions || []); // تخزين الاشتراكات في profileStore

                setDataLoaded(true); // تعيين حالة تحميل البيانات إلى true بعد النجاح

            } catch (error) {
                console.error('❌ خطأ أثناء جلب بيانات المستخدم والاشتراكات في _app.tsx:', error);
                setErrorState('❌ حدث خطأ أثناء تحميل بيانات المستخدم.');
                setDataLoaded(false); // تعيين حالة تحميل البيانات إلى false في حالة الخطأ
            }
        } else {
            console.log('⚠️ لم يتم العثور على telegramId، تخطي تحميل بيانات المستخدم والاشتراكات في _app.tsx.');
            setDataLoaded(true); // إذا لم يكن هناك telegramId، فاعتبر البيانات محملة لتجنب شاشة التحميل اللانهائية
        }
    }, [telegramId, setUserProfile, setUserSubscriptions]); // ✅ إضافة telegramId و setUserProfile و setUserSubscriptions إلى قائمة التبعيات

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
            initializeApp(); // ✅ استدعاء initializeApp مباشرة
            setTimeout(() => {
                if (pagesLoaded && dataLoaded) {
                    setIsAppLoaded(true);
                }
            }, 3000); // تقليل التأخير إلى 3 ثوانٍ
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