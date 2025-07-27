// TelegramContext.tsx (النسخة المبسطة والمحسّنة)
'use client';

import React, { createContext, useContext, useEffect, useState } from "react";
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
  const [isLoading, setIsLoading] = useState(true);
  const [isTelegramApp, setIsTelegramApp] = useState(false);
  const [isTelegramReady, setIsTelegramReady] = useState(false);

  useEffect(() => {
    // إذا كنا في بيئة الخادم، لا تفعل شيئًا
    if (typeof window === 'undefined') {
      console.log("🚫 Running on server, skipping Telegram SDK initialization.");
      setIsLoading(false);
      return;
    }

    // متغير للتحقق مما إذا كان المكون لا يزال محملاً، لمنع تحديث الحالة بعد إلغاء التحميل
    let isMounted = true;

    const initializeTelegram = async () => {
      console.log("🚀 Starting Telegram initialization process...");

      const MAX_ATTEMPTS = 8;
      const RETRY_DELAY_MS = 300;
      let tg: TelegramWebApp | undefined;

      // --- الخطوة 1: انتظار توفر Telegram SDK ---
      for (let i = 0; i < MAX_ATTEMPTS; i++) {
        if (window.Telegram?.WebApp) {
          tg = window.Telegram.WebApp;
          break;
        }
        // انتظر قليلاً قبل المحاولة مرة أخرى
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      }

      // إذا لم يتم العثور على SDK بعد كل المحاولات
      if (!tg) {
        if (isMounted) {
          console.error("❌ Telegram SDK not found after multiple attempts. Assuming not in Telegram environment.");
          setIsTelegramApp(false);
          setIsLoading(false);
        }
        return;
      }
      
      // --- الخطوة 2: تم العثور على SDK، الآن انتظر بيانات المستخدم ---
      if (isMounted) {
        console.log("✅ Telegram WebApp SDK found!");
        setIsTelegramApp(true);
        tg.ready(); // إخبار تيليجرام بأن التطبيق جاهز
      }

      let user;
      for (let i = 0; i < MAX_ATTEMPTS; i++) {
        if (tg.initDataUnsafe?.user?.id) {
            user = tg.initDataUnsafe.user;
            break;
        }
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      }

      // إذا لم يتم العثور على بيانات المستخدم
      if (!user) {
        if (isMounted) {
            console.error("❌ Failed to get user data from Telegram SDK after multiple attempts.");
            setIsLoading(false); // توقف عن التحميل لأننا لا نستطيع المتابعة
        }
        return;
      }
      
      // --- الخطوة 3: تم العثور على كل شيء، قم بتحديث الحالة ---
      if (isMounted) {
        console.log("✅ Telegram User Data Fetched Successfully:", user);
        setUserData({
          telegramId: user.id.toString(),
          telegramUsername: user.username || null,
          fullName: `${user.first_name || ""} ${user.last_name || ""}`.trim() || null,
          photoUrl: user.photo_url || null,
          joinDate: null,
        });
        setIsTelegramReady(true);
        setIsLoading(false); // انتهت عملية التحميل بنجاح
        tg.expand();
      }
    };

    initializeTelegram();

    // دالة التنظيف: تعمل عند إلغاء تحميل المكون
    return () => {
      isMounted = false;
      console.log("🧹 TelegramProvider unmounted. Cleanup complete.");
    };
  }, [setUserData]); // setUserData من Zustand مستقرة ولا تتغير

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