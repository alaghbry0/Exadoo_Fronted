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

interface TelegramContextType {
  telegramId: string | null;
  isTelegramReady: boolean;
  isLoading: boolean;
  isTelegramApp: boolean;
  setTelegramId: Dispatch<SetStateAction<string | null>>;
}

const TelegramContext = createContext<TelegramContextType>({
  telegramId: null,
  isTelegramReady: false,
  isLoading: true,
  isTelegramApp: false,
  setTelegramId: () => {},
});


export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [isTelegramReady, setIsTelegramReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTelegramApp, setIsTelegramApp] = useState(false); // ✅ إضافة state لـ isTelegramApp


  useEffect(() => {
    // ✅ تحديد isTelegramApp داخل useEffect لضمان جانب العميل
    setIsTelegramApp(typeof window !== 'undefined' && !!window.Telegram?.WebApp);
  }, []); // ✅ تشغيل هذا التأثير مرة واحدة فقط عند التحميل الأولي


  const initializeTelegram = useCallback(() => {
    if (!isTelegramApp) {
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
  }, [isTelegramApp]); // ✅ الاعتماد على isTelegramApp state


  useEffect(() => {
    if (!isTelegramApp) {
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
  }, [initializeTelegram, isTelegramApp]);


  const value: TelegramContextType = {
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