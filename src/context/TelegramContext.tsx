'use client';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
  useRef, // ✅ استيراد useRef
} from "react";

interface TelegramContextType {
  telegramId: string | null;
  isTelegramReady: boolean;
  isLoading: boolean;
  isTelegramApp: boolean;
  setTelegramId: Dispatch<SetStateAction<string | null>>;
  webApp: TelegramWebApp | null; // ✅ إضافة webApp إلى السياق
}

const TelegramContext = createContext<TelegramContextType>({
  telegramId: null,
  isTelegramReady: false,
  isLoading: true,
  isTelegramApp: false,
  setTelegramId: () => {},
  webApp: null, // ✅ قيمة افتراضية لـ webApp
});


export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [isTelegramReady, setIsTelegramReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTelegramApp, setIsTelegramApp] = useState(false);
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null); // ✅ إضافة state لـ webApp
  const isTelegramAppRef = useRef(false); // ✅ useRef لـ isTelegramApp


  useEffect(() => {
    const isClientSideTelegramApp = typeof window !== 'undefined' && !!window.Telegram?.WebApp;
    setIsTelegramApp(isClientSideTelegramApp);
    isTelegramAppRef.current = isClientSideTelegramApp; // تحديث المرجع
  }, []);


  const initializeTelegram = useCallback(() => {
    if (!isTelegramAppRef.current) { // ✅ استخدام المرجع هنا
      console.log("✅ التطبيق يعمل خارج Telegram WebApp");
      setIsLoading(false);
      return;
    }

    const tg = window.Telegram?.WebApp;

    if (!tg) {
      console.warn("⚠️ Telegram WebApp غير متاح");
      setIsLoading(false);
      return;
    }

    setWebApp(tg); // ✅ تعيين webApp state هنا
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
  }, []); // ✅ تم إزالة isTelegramApp من هنا


  useEffect(() => {
    if (!isTelegramAppRef.current) { // ✅ استخدام المرجع هنا
      setIsLoading(false);
      return;
    }

    const storedTelegramId = sessionStorage.getItem("telegramId") || localStorage.getItem("telegramId");
    if (storedTelegramId) {
      setTelegramId(storedTelegramId);
      setIsTelegramReady(true);
      setIsLoading(false);
      console.log("✅ تم استرجاع telegram_id من التخزين:", storedTelegramId);
      return;
    }

    initializeTelegram();
  }, [initializeTelegram]); // ✅ تم إزالة isTelegramApp من هنا


  const value: TelegramContextType = {
    telegramId,
    isTelegramReady,
    isLoading,
    isTelegramApp,
    setTelegramId,
    webApp, // ✅ تضمين webApp في القيمة
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