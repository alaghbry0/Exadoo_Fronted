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
        if (userId !== telegramId) {
          setTelegramId(userId);
          setIsTelegramReady(true);
          console.log("✅ Telegram User ID:", userId);
        }
      } else {
        console.warn("⚠️ لم يتم العثور على معرف Telegram.");
      }

      setIsLoading(false);
    } catch (error) {
      console.error("❌ خطأ أثناء تهيئة Telegram WebApp:", error);
      setIsLoading(false);
    }
  }, [telegramId]);

  useEffect(() => {
    let retryInterval: NodeJS.Timeout | null = null;

    const checkTelegram = () => {
      if (!telegramId) {
        initializeTelegram();
        retryInterval = setInterval(() => {
          if (telegramId) {
            if (retryInterval) clearInterval(retryInterval);
          } else {
            initializeTelegram();
          }
        }, 1000);
      }
    };

    checkTelegram();

    return () => {
      if (retryInterval) clearInterval(retryInterval);
    };
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
