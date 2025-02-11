'use client';
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useUserStore } from "../stores/zustand/userStore";

interface TelegramContextType {
    isTelegramReady: boolean;
    isLoading: boolean;
    isTelegramApp: boolean;
    telegramId: string | null;
}

const TelegramContext = createContext<TelegramContextType>({
    isTelegramReady: false,
    isLoading: true,
    isTelegramApp: false,
    telegramId: null,
});

export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
    const { setUserData, telegramId: contextTelegramId } = useUserStore();

    const [isTelegramReady, setIsTelegramReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isTelegramApp, setIsTelegramApp] = useState(false);
    const isTelegramAppRef = useRef(false);
    const retryTimeoutRef = useRef<number | null>(null);

    // ✅ Clear retry timeout
    const clearRetryTimeout = useCallback<() => void>(() => {
        if (retryTimeoutRef.current) {
            console.log("TelegramContext: clearRetryTimeout - Clearing retry timeout");
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }
    }, []);


    // ✅ تعريف fetchTelegramUserData - **بعد تعريف clearRetryTimeout**
    const fetchTelegramUserData = useCallback<() => void>((): void => {
        console.log("TelegramContext: fetchTelegramUserData - Function called");
        console.log("TelegramContext: fetchTelegramUserData - isTelegramAppRef.current:", isTelegramAppRef.current);

        if (!isTelegramAppRef.current) {
            console.log("TelegramContext: fetchTelegramUserData - Not in Telegram WebApp, exiting");
            setIsLoading(false);
            return;
        }

        const tg = window.Telegram?.WebApp;
        console.log("TelegramContext: fetchTelegramUserData - window.Telegram?.WebApp:", tg);

        if (!tg) {
            console.warn("TelegramContext: fetchTelegramUserData - Telegram WebApp not available (tg is null), exiting");
            setIsLoading(false);
            return;
        }
        tg.ready();
        tg.expand();
        console.log("TelegramContext: fetchTelegramUserData - Telegram WebApp ready and expanded");


        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            const user = tg.initDataUnsafe.user;
            const userData = {
                telegramId: user.id?.toString() || null,
                telegramUsername: user.username || null,
                fullName: `${user.first_name || ""} ${user.last_name || ""}`.trim() || null,
                photoUrl: user.photo_url || null,
                joinDate: null,
            };

            console.log("✅ Telegram User Data Fetched:", userData);

            setUserData(userData);
            setIsTelegramReady(true);
            setIsLoading(false);
            clearRetryTimeout();
            console.log("TelegramContext: fetchTelegramUserData - User data set in userStore, isLoading false, retry timeout cleared, exiting success path");
            return;
        } else {
            console.log("TelegramContext: fetchTelegramUserData - tg.initDataUnsafe or tg.initDataUnsafe.user is missing");
        }

        retryInitDataFetch();
     }, [setUserData, clearRetryTimeout/*, retryInitDataFetch - REMOVED FROM DEPENDENCIES */]); // ✅ تم إزالة retryInitDataFetch من قائمة التبعيات


    // ✅ Retry mechanism with useCallback and useRef - **بعد تعريف fetchTelegramUserData و clearRetryTimeout**
    const retryInitDataFetch = useCallback<() => void>(() => {
        console.log("TelegramContext: retryInitDataFetch - Attempting to fetch initDataUnsafe again in 1 seconds...");
        retryTimeoutRef.current = window.setTimeout(fetchTelegramUserData, 1000);
    }, [fetchTelegramUserData]); // ✅ إضافة fetchTelegramUserData كـ dependency


    useEffect(() => {
        const isClientSideTelegramApp = typeof window !== 'undefined' && !!window.Telegram?.WebApp;
        setIsTelegramApp(isClientSideTelegramApp);
        isTelegramAppRef.current = isClientSideTelegramApp;
        console.log("TelegramContext: useEffect 1 - isTelegramApp set to:", isClientSideTelegramApp);
    }, []);


    useEffect(() => {
        console.log("TelegramContext: useEffect 2 - Calling fetchTelegramUserData on component mount");
        fetchTelegramUserData();
        return () => {
            console.log("TelegramContext: useEffect 2 - Component unmounted, clearing retry timeout");
            clearRetryTimeout();
        };
    }, [fetchTelegramUserData, clearRetryTimeout]);


    const value: TelegramContextType = {
        isTelegramReady,
        isLoading,
        isTelegramApp,
        telegramId: contextTelegramId,
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