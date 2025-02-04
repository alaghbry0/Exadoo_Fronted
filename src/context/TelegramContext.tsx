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
}>({
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
        return false;
      }

      tg.expand();
      tg.ready();

      const userId = tg.initDataUnsafe?.user?.id?.toString();
      if (userId) {
        setTelegramId(userId);
        setIsTelegramReady(true);
        console.log("✅ Telegram User ID:", userId);
        setIsLoading(false);
        return true;
      }

      return false;
    } catch (error) {
      console.error("❌ خطأ أثناء تهيئة Telegram WebApp:", error);
      setIsLoading(false);
      return false;
    }
  }, []);

  useEffect(() => {
    let retryInterval: NodeJS.Timeout | null = null;

    const checkTelegram = () => {
      if (initializeTelegram()) return;
      retryInterval = setInterval(() => {
        if (initializeTelegram()) {
          if (retryInterval) clearInterval(retryInterval);
        }
      }, 500);
    };

    checkTelegram();

    return () => {
      if (retryInterval) clearInterval(retryInterval);
    };
  }, [initializeTelegram]);

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
