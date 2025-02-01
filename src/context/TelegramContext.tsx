import { createContext, useContext, useEffect, useState } from "react";

// ✅ إنشاء `Context` لحفظ بيانات المستخدم من Telegram API
const TelegramContext = createContext<{ telegramId: string | null }>({ telegramId: null });

export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
  const [telegramId, setTelegramId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fetchTelegramId = () => {
      let newTelegramId: string | null = null;

      // ✅ 1️⃣ الحصول على `telegram_id` من Telegram Mini App إذا كان التطبيق مفتوحًا داخل Telegram
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

      // ✅ تحديث `telegramId` فقط إذا تغيرت القيمة
      if (newTelegramId && newTelegramId !== telegramId) {
        setTelegramId(newTelegramId);
      }
    };

    fetchTelegramId();
    window.addEventListener("popstate", fetchTelegramId);

    return () => {
      window.removeEventListener("popstate", fetchTelegramId);
    };
  }, [telegramId]);

  return (
    <TelegramContext.Provider value={{ telegramId }}>
      {children}
    </TelegramContext.Provider>
  );
};

// ✅ دالة `useTelegram` للوصول إلى `telegram_id` في أي مكون بسهولة
export const useTelegram = () => useContext(TelegramContext);
