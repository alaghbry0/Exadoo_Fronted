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
        onEvent: (
          eventType: 'invoiceClosed' | 'themeChanged',
          callback: () => void
        ) => void;
        offEvent: (
          eventType: 'invoiceClosed' | 'themeChanged',
          callback: () => void
        ) => void;
        openInvoice: (url: string, callback: (status: string) => void) => void;
      };
    };
  }
}

const TelegramContext = createContext<{
  telegramId: string | null;
  isTelegramReady: boolean;
  setTelegramId: (id: string | null) => void;
}>({
  telegramId: null,
  isTelegramReady: false,
  setTelegramId: () => {},
});

export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [isTelegramReady, setIsTelegramReady] = useState(false);

  const initializeTelegram = useCallback(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) {
      console.warn("⚠️ Telegram WebApp not available");
      return false;
    }

    tg.expand();
    tg.ready();

    const userId = tg.initDataUnsafe?.user?.id?.toString();
    if (userId) {
      setTelegramId(userId);
      setIsTelegramReady(true);
      console.log("✅ Telegram User ID:", userId);
      return true;
    }

    return false;
  }, []);

  useEffect(() => {
    const checkTelegram = () => {
      if (initializeTelegram()) return;

      const retryInterval = setInterval(() => {
        if (initializeTelegram()) {
          clearInterval(retryInterval);
        }
      }, 500);

      return () => clearInterval(retryInterval);
    };

    const timeout = setTimeout(checkTelegram, 1000);
    return () => clearTimeout(timeout);
  }, [initializeTelegram]);

  useEffect(() => {
    if (!window.Telegram?.WebApp) return;

    const handleThemeChange = () => {
      console.log("🎨 Theme changed, reloading Telegram data...");
      initializeTelegram();
    };

    window.Telegram.WebApp.onEvent("themeChanged", handleThemeChange);
    return () => window.Telegram.WebApp.offEvent("themeChanged", handleThemeChange);
  }, [initializeTelegram]);

  return (
    <TelegramContext.Provider value={{ telegramId, isTelegramReady, setTelegramId }}>
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => useContext(TelegramContext);
