'use client';
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useUserStore } from "../stores/zustand/userStore"; // ✅ استيراد Zustand Store

interface TelegramContextType {
    isTelegramReady: boolean;
    isLoading: boolean;
    isTelegramApp: boolean;
    telegramId: string | null; // ✅ إضافة telegramId إلى الواجهة
}

const TelegramContext = createContext<TelegramContextType>({
    isTelegramReady: false,
    isLoading: true,
    isTelegramApp: false,
    telegramId: null, // ✅ تهيئة telegramId في القيمة الافتراضية
});

export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
    const { setUserData, telegramId: contextTelegramId } = useUserStore(); // ✅ استخراج telegramId من userStore

    const [isTelegramReady, setIsTelegramReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isTelegramApp, setIsTelegramApp] = useState(false);
    const isTelegramAppRef = useRef(false);
    const retryTimeoutRef = useRef<number | null>(null); // useRef for timeout ID


    useEffect(() => {
        const isClientSideTelegramApp = typeof window !== 'undefined' && !!window.Telegram?.WebApp;
        setIsTelegramApp(isClientSideTelegramApp);
        isTelegramAppRef.current = isClientSideTelegramApp;
        console.log("TelegramContext: useEffect 1 - isTelegramApp set to:", isTelegramApp); // ✅ Log
    }, [setIsTelegramApp]);


    // ✅ Retry mechanism with useCallback and useRef - **نقل التعريف إلى هنا**
    const retryInitDataFetch = useCallback(() => {
        console.log("TelegramContext: retryInitDataFetch - Attempting to fetch initDataUnsafe again in 1 seconds..."); // ✅ Log
        retryTimeoutRef.current = window.setTimeout(fetchTelegramUserData, 1000); // Retry after 1 second
    }, []); // ✅ إزالة fetchTelegramUserData من قائمة التبعيات هنا!


    // ✅ Clear retry timeout - **نقل التعريف إلى هنا**
    const clearRetryTimeout = useCallback(() => {
        if (retryTimeoutRef.current) {
            console.log("TelegramContext: clearRetryTimeout - Clearing retry timeout"); // ✅ Log
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }
    }, []);


    const fetchTelegramUserData = useCallback((): void => { // ✅ إضافة نوع الإرجاع void هنا
        console.log("TelegramContext: fetchTelegramUserData called"); // ✅ Log
        if (!isTelegramAppRef.current) {
            console.log("TelegramContext: fetchTelegramUserData - Not in Telegram WebApp"); // ✅ Log
            setIsLoading(false);
            return;
        }

        const tg = window.Telegram?.WebApp;
        if (!tg) {
            console.warn("TelegramContext: fetchTelegramUserData - Telegram WebApp not available (tg is null)"); // ✅ Log
            setIsLoading(false);
            return;
        }
        tg.ready();
        tg.expand();
        console.log("TelegramContext: fetchTelegramUserData - Telegram WebApp ready and expanded"); // ✅ Log


        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            const user = tg.initDataUnsafe.user;
            const userData = {
                telegramId: user.id?.toString() || null,
                telegramUsername: user.username || null,
                fullName: `${user.first_name || ""} ${user.last_name || ""}`.trim() || null,
                photoUrl: user.photo_url || null,
                joinDate: null, // ✅ إضافة خاصية joinDate وتعيينها إلى null مؤقتًا
            };

            console.log("✅ Telegram User Data:", userData);

            // ✅ تخزين البيانات في Zustand Store (userStore) باستخدام setUserData
            setUserData(userData);
            setIsTelegramReady(true);
            setIsLoading(false);
            clearRetryTimeout(); // ✅ Clear retry timeout on success
            console.log("TelegramContext: fetchTelegramUserData - User data set in userStore, isLoading false, retry timeout cleared"); // ✅ Log
            return; // ✅ Early return on success
        }

        // If initDataUnsafe is not available or userId not found, retry after a delay
        retryInitDataFetch();
    }, [setUserData, retryInitDataFetch, clearRetryTimeout]); // ✅ تم إضافة retryInitDataFetch و clearRetryTimeout كـ dependencies


    const value: TelegramContextType = {
        isTelegramReady,
        isLoading,
        isTelegramApp,
        telegramId: contextTelegramId, // ✅ تضمين telegramId في قيمة Context
    };

    return (
        <TelegramContext.Provider value={value}>
            {children}
        </TelegramContext.Provider>
    );
};


export const useTelegram = () => {
    const context = useContext(TelegramContext);
    if (!context) {
        throw new Error("useTelegram must be used within a TelegramProvider");
    }
    return context;
};