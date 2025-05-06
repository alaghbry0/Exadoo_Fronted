
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
  const fetchTelegramUserDataRef = useRef<() => void>(() => {});

  // ✅ مسح الـ timeout عند الحاجة
  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      console.log("Clearing retry timeout...");
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  // ✅ آلية إعادة المحاولة
  const retryInitDataFetch = useCallback(() => {
    console.log("Retrying fetch in 1 second...");
    retryTimeoutRef.current = window.setTimeout(() => {
      fetchTelegramUserDataRef.current();
    }, 1000);
  }, []);

  // ✅ جلب بيانات المستخدم من Telegram
  const fetchTelegramUserData = useCallback(() => {
    console.log("Fetching Telegram User Data...");
    console.log("isTelegramAppRef.current:", isTelegramAppRef.current);

    if (!isTelegramAppRef.current) {
      console.log("Not in Telegram WebApp, exiting...");
      setIsLoading(false);
      return;
    }

    const tg = window.Telegram?.WebApp;
    console.log("Telegram WebApp instance:", tg);

    if (!tg) {
      console.warn("Telegram WebApp not available, exiting...");
      setIsLoading(false);
      return;
    }

    tg.ready();
    tg.expand();

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
      return;
    } else {
      console.log("Telegram initDataUnsafe is missing user data.");
    }

    retryInitDataFetch();
  }, [setUserData, clearRetryTimeout, retryInitDataFetch, setIsLoading, setIsTelegramReady]);

  // ✅ تحديث المرجع ليشير إلى الدالة الصحيحة
  useEffect(() => {
    fetchTelegramUserDataRef.current = fetchTelegramUserData;
  }, [fetchTelegramUserData]);

  // ✅ تنفيذ عند تحميل المكون
  useEffect(() => {
    setTimeout(() => {
      const isClientSideTelegramApp = typeof window !== 'undefined' && !!window.Telegram?.WebApp;
      setIsTelegramApp(isClientSideTelegramApp);
      isTelegramAppRef.current = isClientSideTelegramApp;

      console.log("Detected Telegram WebApp:", isClientSideTelegramApp);

      fetchTelegramUserData();
    }, 200);

    return () => {
      console.log("Component unmounted, clearing retry timeout...");
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