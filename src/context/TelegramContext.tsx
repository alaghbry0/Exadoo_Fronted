// TelegramContext.tsx
'use client';
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useUserStore } from "../stores/zustand/userStore";
import { syncUserData } from '../services/api';

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
  const [isLoading, setIsLoading] = useState(true); // يبدأ التحميل افتراضيًا
  const [isTelegramApp, setIsTelegramApp] = useState(false);

  const isTelegramAppRef = useRef(false);
  const retryTimeoutRef = useRef<number | null>(null);
  const fetchTelegramUserDataRef = useRef<() => void>(() => {});

  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      console.log("🧹 Clearing pending retry timeout...");
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const retryInitDataFetch = useCallback(() => {
    clearRetryTimeout();
    console.log("⏳ Scheduling retry fetch for initDataUnsafe in 1 second...");
    retryTimeoutRef.current = window.setTimeout(() => {
      console.log("🔄 Executing scheduled retry fetch for initDataUnsafe...");
      fetchTelegramUserDataRef.current();
    }, 1000);
  }, [clearRetryTimeout]);

  const fetchTelegramUserData = useCallback(() => {
    console.log("🚀 Attempting to fetch Telegram User Data...");

    if (!isTelegramAppRef.current) {
      console.log("🚫 Not running inside Telegram WebApp (checked in fetch). Setting loading to false.");
      setIsLoading(false);
      clearRetryTimeout();
      return;
    }

    const tg = window.Telegram?.WebApp;
    console.log("🔍 Telegram WebApp instance:", tg);

    if (!tg) {
      // هذه الحالة يجب ألا تحدث إذا كان isTelegramAppRef.current صحيحًا,
      // ولكن كتحقق إضافي.
      console.warn("⚠️ Telegram WebApp SDK (window.Telegram.WebApp) not found unexpectedly. Setting loading to false.");
      setIsLoading(false);
      clearRetryTimeout();
      return;
    }

    tg.ready();
    tg.expand();

    console.log("🔐 Checking tg.initDataUnsafe for user data...");
    if (tg.initDataUnsafe?.user?.id) {
      const user = tg.initDataUnsafe.user;
      const userData = {
        telegramId: user.id.toString(),
        telegramUsername: user.username || null,
        fullName: `${user.first_name || ""} ${user.last_name || ""}`.trim() || null,
        photoUrl: user.photo_url || null,
        joinDate: null,
      };

      console.log("✅ Telegram User Data Fetched Successfully:", userData);

      setUserData(userData);       // تحديث بيانات المستخدم في Zustand (للتفاعل الفوري في الواجهة)
      setIsTelegramReady(true);
      setIsLoading(false);
      clearRetryTimeout();

      // 💡 2. استدعاء دالة المزامنة مع الخادم في الخلفية

      syncUserData({
        telegramId: userData.telegramId,
        telegramUsername: userData.telegramUsername,
        fullName: userData.fullName,
      });

    } else {
      console.warn("⏳ Telegram initDataUnsafe.user or user.id is missing. Scheduling retry for initDataUnsafe.");
      console.log("ℹ️ Current initDataUnsafe:", JSON.stringify(tg.initDataUnsafe));
      retryInitDataFetch();
    }
  }, [setUserData, clearRetryTimeout, retryInitDataFetch]);

  useEffect(() => {
    fetchTelegramUserDataRef.current = fetchTelegramUserData;
  }, [fetchTelegramUserData]);

  // --- ⭐ تعديل جوهري هنا: محاولة الكشف عن بيئة تليجرام بشكل متكرر ---
  useEffect(() => {
    console.log("🚀 TelegramProvider mounted. Starting Telegram environment detection...");

    // إذا كنا في بيئة الخادم، فلا نفعل شيئًا
    if (typeof window === 'undefined') {
      console.log("🚫 Running on server, skipping Telegram SDK detection.");
      setIsLoading(false); // ليس هناك تحميل لبيانات تيليجرام
      setIsTelegramApp(false);
      return;
    }

    const MAX_DETECTION_ATTEMPTS = 8; // محاولة 5 مرات
    const DETECTION_INTERVAL = 300; // كل 300 مللي ثانية
    let detectionAttempts = 0;

    const detectTelegramEnv = () => {
      const tgWebApp = window.Telegram?.WebApp;
      if (tgWebApp) {
        console.log("✅ Telegram WebApp SDK found!");
        setIsTelegramApp(true);
        isTelegramAppRef.current = true;
        // الآن بعد أن وجدنا بيئة تليجرام، نبدأ في جلب بيانات المستخدم
        fetchTelegramUserDataRef.current();
      } else {
        detectionAttempts++;
        if (detectionAttempts < MAX_DETECTION_ATTEMPTS) {
          console.warn(`⚠️ Telegram WebApp SDK not found (attempt ${detectionAttempts}/${MAX_DETECTION_ATTEMPTS}). Retrying in ${DETECTION_INTERVAL}ms...`);
          retryTimeoutRef.current = window.setTimeout(detectTelegramEnv, DETECTION_INTERVAL);
        } else {
          console.error(`❌ Telegram WebApp SDK not found after ${MAX_DETECTION_ATTEMPTS} attempts. Assuming not in Telegram environment.`);
          setIsTelegramApp(false);
          isTelegramAppRef.current = false;
          setIsLoading(false); // توقف عن التحميل، لأننا قررنا أننا لسنا في تليجرام
        }
      }
    };

    detectTelegramEnv(); // ابدأ المحاولة الأولى للكشف

    return () => {
      console.log("🧹 TelegramProvider unmounted. Clearing any pending detection/retry timeout.");
      clearRetryTimeout(); // هذا سيمسح مؤقت الكشف أو مؤقت جلب البيانات
    };
  // clearRetryTimeout مستقر، fetchTelegramUserDataRef يتم تحديثه بشكل منفصل
  // لذا، هذا الـ effect سيعمل مرة واحدة عند التحميل والتنظيف عند الإزالة
  }, [clearRetryTimeout]);
  // --- نهاية التعديل الجوهري ---


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