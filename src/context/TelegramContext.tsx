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
      };
    };
  }
}

const TelegramContext = createContext<{
  telegramId: string | null;
}>({
  telegramId: null,
});

export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
  const [telegramId, setTelegramId] = useState<string | null>(null);

  const initializeTelegram = useCallback(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) {
      console.warn("Telegram WebApp not available");
      return false;
    }

    tg.expand();
    tg.ready();

    const userId = tg.initDataUnsafe?.user?.id?.toString();
    if (userId) {
      setTelegramId(userId);
      console.log("Telegram User ID:", userId);
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

  return (
    <TelegramContext.Provider value={{ telegramId }}>
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => useContext(TelegramContext);