'use client'
import { createContext, useContext, useEffect, useState, useCallback } from "react";

// ✅ تعريف `window.Telegram` لتجنب أخطاء TypeScript
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initDataUnsafe?: {
          user?: {
            id?: number;
          };
        };
        ready: () => void;
      };
    };
  }
}

// ✅ إنشاء `Context` لحفظ بيانات Telegram
const TelegramContext = createContext<{
  telegramId: string | null;
  setTelegramId: (id: string | null) => void;
}>({
  telegramId: null,
  setTelegramId: () => {},
});

export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [isTelegramLoaded, setIsTelegramLoaded] = useState(false); // ✅ التأكد من تحميل Telegram API

  const fetchTelegramId = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      let newTelegramId: string | null = null;

      // ✅ 1️⃣ التحقق مما إذا كان Telegram API متاحًا
      if (!window.Telegram || !window.Telegram.WebApp) {
        console.warn("⚠️ Telegram API غير متاح، سيتم إعادة المحاولة...");
        setTimeout(fetchTelegramId, 1000); // إعادة المحاولة بعد 1 ثانية
        return;
      }

      // ✅ 2️⃣ التأكد من تحميل Telegram WebApp بالكامل
      if (!isTelegramLoaded) {
        window.Telegram.WebApp.ready();
        setIsTelegramLoaded(true);
      }

      // ✅ 3️⃣ استخراج `telegram_id` من Telegram API
      if (window.Telegram.WebApp.initDataUnsafe?.user?.id) {
        newTelegramId = window.Telegram.WebApp.initDataUnsafe.user.id.toString();
        console.log(`✅ تم الحصول على telegram_id من Telegram API: ${newTelegramId}`);
      }

      // ✅ 4️⃣ إذا لم يكن متاحًا، جرب البحث في URL
      if (!newTelegramId) {
        const urlParams = new URLSearchParams(window.location.search);
        newTelegramId = urlParams.get("telegram_id");

        if (newTelegramId) {
          console.log(`✅ تم الحصول على telegram_id من URL: ${newTelegramId}`);
        } else {
          console.warn("⚠️ لم يتم العثور على `telegram_id` من Telegram API أو URL.");
        }
      }

      // ✅ 5️⃣ تحديث الحالة إذا تم العثور على `telegram_id`
      if (newTelegramId && newTelegramId !== telegramId) {
        setTelegramId(newTelegramId);
      }
    } catch (error) {
      console.error("❌ خطأ أثناء جلب `telegram_id`:", error);
    }
  }, [telegramId, isTelegramLoaded]);

  useEffect(() => {
    setTimeout(fetchTelegramId, 500); // ⏳ تأخير أولي قبل محاولة جلب `telegram_id`
    window.addEventListener("popstate", fetchTelegramId);

    return () => {
      window.removeEventListener("popstate", fetchTelegramId);
    };
  }, [fetchTelegramId]);

  return (
    <TelegramContext.Provider value={{ telegramId, setTelegramId }}>
      {children}
    </TelegramContext.Provider>
  );
};

// ✅ دالة `useTelegram` للوصول إلى `telegram_id` في أي مكون بسهولة
export const useTelegram = () => useContext(TelegramContext);
