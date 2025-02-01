import { createContext, useContext, useEffect, useState, useCallback } from "react";

// ✅ إنشاء `Context` لحفظ بيانات المستخدم من Telegram API
const TelegramContext = createContext<{
  telegramId: string | null;
  setTelegramId: (id: string | null) => void;
}>({
  telegramId: null,
  setTelegramId: () => {}
});

export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
  const [telegramId, setTelegramId] = useState<string | null>(null);

  // ✅ دالة لجلب `telegram_id` من Telegram Mini App أو من `URL Parameters`
  const fetchTelegramId = useCallback(() => {
    let newTelegramId: string | null = null;

    if (typeof window === "undefined") return;

    // ✅ 1️⃣ الحصول على `telegram_id` من Telegram Mini App إذا كان مفتوحًا داخل Telegram
    if (window.Telegram && window.Telegram.WebApp) {
      const tgData = window.Telegram.WebApp.initDataUnsafe;
      if (tgData?.user?.id) {
        newTelegramId = tgData.user.id.toString();
        console.log(`✅ تم الحصول على telegram_id من Telegram API: ${newTelegramId}`);
      }
    }

    // ✅ 2️⃣ في حال عدم توفر `Telegram API`، نستخدم `URL Parameters`
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

    // ✅ تحديث `telegramId` فقط إذا كانت قيمة جديدة وغير فارغة
    if (newTelegramId && newTelegramId !== telegramId) {
      setTelegramId(newTelegramId);
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
