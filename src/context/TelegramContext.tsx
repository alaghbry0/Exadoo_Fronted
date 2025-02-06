'use client'
import { createContext, useContext, useEffect, useState, useCallback } from "react";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
        initDataUnsafe?: {
          user?: {
            id?: number;
          };
        };
        ready: () => void;
        expand: () => void;
        onEvent?: (eventType: 'invoiceClosed' | 'themeChanged', callback: () => void) => void;
        offEvent?: (eventType: 'invoiceClosed' | 'themeChanged', callback: () => void) => void;
        openInvoice?: (url: string, callback: (status: string) => void) => void;
        showAlert?: (message: string, callback?: () => void) => void;
      };
    };
  }
}

const TelegramContext = createContext<{
  telegramId: string | null;
  isTelegramReady: boolean;
  isLoading: boolean;
  setTelegramId: (id: string | null) => void;
}>( {
  telegramId: null,
  isTelegramReady: false,
  isLoading: true,
  setTelegramId: () => {},
});

export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [isTelegramReady, setIsTelegramReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const initializeTelegram = useCallback(() => {
    try {
      const tg = window.Telegram?.WebApp;
      if (!tg) {
        console.warn("⚠️ Telegram WebApp غير متوفر");
        setIsLoading(false);
        return;
      }

      tg.expand();
      tg.ready();

      const userId = tg.initDataUnsafe?.user?.id?.toString() || null;

      if (userId) {
        console.log("✅ Telegram User ID:", userId);
        setTelegramId(userId);
        setIsTelegramReady(true);
        setTimeout(() => setIsLoading(false), 500); // تأخير بسيط لضمان تحميل البيانات
      } else {
        console.warn("⚠️ لم يتم العثور على معرف Telegram.");
        setTimeout(() => initializeTelegram(), 2000); // إعادة المحاولة بعد ثانيتين
      }
    } catch (error) {
      console.error("❌ خطأ أثناء تهيئة Telegram WebApp:", error);
      setTimeout(() => initializeTelegram(), 3000); // إعادة المحاولة بعد 3 ثوانٍ عند الخطأ
    }
  }, []);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 5;

    const retryFetch = () => {
      if (!telegramId && attempts < maxAttempts) {
        console.warn(`⚠️ المحاولة رقم ${attempts + 1} للحصول على telegram_id...`);
        initializeTelegram();
        attempts++;
        setTimeout(retryFetch, 2000);
      } else if (!telegramId) {
        console.error("❌ فشل الحصول على معرف Telegram بعد عدة محاولات.");
        setIsLoading(false);
      }
    };

    retryFetch();
  }, [initializeTelegram, telegramId]);

  useEffect(() => {
    if (!window.Telegram?.WebApp?.onEvent || !window.Telegram?.WebApp?.offEvent) return;

    const handleThemeChange = () => {
      console.log("🎨 تم تغيير الثيم، إعادة تحميل بيانات تيليجرام...");
      initializeTelegram();
    };

    window.Telegram.WebApp.onEvent("themeChanged", handleThemeChange);
    return () => {
      window.Telegram?.WebApp?.offEvent?.("themeChanged", handleThemeChange);
    };
  }, [initializeTelegram]);

  return (
    <TelegramContext.Provider value={{ telegramId, isTelegramReady, isLoading, setTelegramId }}>
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => useContext(TelegramContext);
