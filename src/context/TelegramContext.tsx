import { createContext, useContext, useEffect, useState, useCallback } from "react";

// ✅ تعريف `window.Telegram` لتجنب خطأ TypeScript
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

// ✅ إنشاء `Context` لحفظ بيانات المستخدم من Telegram API
const TelegramContext = createContext<{
  telegramId: string | null;
  setTelegramId: (id: string | null) => void;
}>({
  telegramId: null,
  setTelegramId: () => {},
});

export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
  const [telegramId, setTelegramId] = useState<string | null>(null);

  // ✅ دالة لجلب `telegram_id` من Telegram Mini App أو من `URL Parameters`
  const fetchTelegramId = useCallback(() => {
    let newTelegramId: string | null = null;

    if (typeof window === "undefined") return;

    // ✅ 1️⃣ التأكد من أن Telegram WebApp جاهز
    if (window?.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
    }

    // ✅ 2️⃣ الحصول على `telegram_id` من Telegram API إذا كان متاحًا
    if (window?.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      newTelegramId = window.Telegram.WebApp.initDataUnsafe.user.id.toString();
      console.log(`✅ تم الحصول على telegram_id من Telegram API: ${newTelegramId}`);
    }

    // ✅ 3️⃣ في حال عدم توفر `Telegram API`، نستخدم `URL Parameters`
    if (!newTelegramId) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlTelegramId = urlParams.get("telegram_id");

      if (urlTelegramId) {
        newTelegramId = urlTelegramId;
        console.log(`✅ تم الحصول على telegram_id من URL: ${urlTelegramId}`);
      } else {
        console.warn("⚠️ لم يتم العثور على `telegram_id` من Telegram API أو URL.");
      }
    }

    // ✅ 4️⃣ تحديث `telegramId` فقط إذا كانت قيمة جديدة وغير فارغة
    if (newTelegramId && newTelegramId !== telegramId) {
      setTelegramId(newTelegramId);
    } else {
      // ✅ 5️⃣ إعادة المحاولة بعد 500 مللي ثانية إذا لم يتم العثور على `telegram_id`
      setTimeout(fetchTelegramId, 500);
    }
  }, [telegramId]);

  useEffect(() => {
    fetchTelegramId();
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
