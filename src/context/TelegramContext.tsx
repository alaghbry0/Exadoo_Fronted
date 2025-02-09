'use client';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";

// ✅ تم حذف كتلة declare global من هنا

// ✅ تعريف نوع السياق بشكل صحيح ليشمل Dispatch<SetStateAction<string | null>>
interface TelegramContextType {
  telegramId: string | null;
  isTelegramReady: boolean;
  isLoading: boolean;
  isTelegramApp: boolean;
  setTelegramId: Dispatch<SetStateAction<string | null>>;
}

// ✅ تهيئة السياق بقيمة افتراضية مبسطة لـ setTelegramId (وظيفة فارغة بسيطة)
const TelegramContext = createContext<TelegramContextType>({
  telegramId: null,
  isTelegramReady: false,
  isLoading: true,
  isTelegramApp: false,
  setTelegramId: () => {}, // ✅ وظيفة فارغة بسيطة كقيمة افتراضية لـ setTelegramId
});


export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [isTelegramReady, setIsTelegramReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ تحديد isTelegramApp مرة واحدة فقط خارج useEffect
  const isTelegramApp = typeof window !== 'undefined' && !!window.Telegram?.WebApp;


  const initializeTelegram = useCallback(() => {
    if (!isTelegramApp) {
      console.log("✅ التطبيق يعمل خارج Telegram WebApp");
      setIsLoading(false);
      return;
    }

    const tg = window.Telegram?.WebApp; // ✅ الوصول إلى window.Telegram?.WebApp هنا فقط

    if (!tg) {
      console.warn("⚠️ Telegram WebApp غير متاح");
      setIsLoading(false);
      return;
    }

    tg.ready();
    tg.expand();
    console.log("✅ تم تهيئة Telegram WebApp بنجاح");

    const userId = tg.initDataUnsafe?.user?.id?.toString() || null;
    if (userId) {
      console.log("✅ Telegram User ID:", userId);
      setTelegramId(userId);
      sessionStorage.setItem("telegramId", userId);
      localStorage.setItem("telegramId", userId);
      setIsTelegramReady(true);
    } else {
      console.warn("⚠️ لم يتم العثور على معرف Telegram.");
    }

    setIsLoading(false);
  }, [isTelegramApp]); // ✅ إزالة التحقق من window من هنا


  useEffect(() => {
    if (!isTelegramApp) { // ✅ استخدام isTelegramApp التي تم تحديدها مسبقًا
      setIsLoading(false); // ✅ يجب تحديث isLoading حتى لو لم يكن Telegram App
      return;
    }


    // ✅ محاولة استرجاع `telegramId` من `sessionStorage` أو `localStorage`
    const storedTelegramId = sessionStorage.getItem("telegramId") || localStorage.getItem("telegramId");
    if (storedTelegramId) {
      setTelegramId(storedTelegramId);
      setIsTelegramReady(true);
      setIsLoading(false);
      console.log("✅ تم استرجاع telegram_id من التخزين:", storedTelegramId);
      return;
    }

    initializeTelegram(); // ✅ استدعاء initializeTelegram مباشرة بدون تأخير
  }, [initializeTelegram, isTelegramApp]); // ✅ إضافة isTelegramApp هنا


  const value: TelegramContextType = { // ✅ إنشاء كائن القيمة بشكل صحيح
    telegramId,
    isTelegramReady,
    isLoading,
    isTelegramApp,
    setTelegramId,
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