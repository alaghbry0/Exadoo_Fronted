'use client'
import { useState } from "react";
import { useTelegram } from "../context/TelegramContext";

export const useTelegramPayment = () => {
  const { telegramId } = useTelegram();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTelegramStarsPayment = async (
    planId: number,
    price: number,
    onSuccess: () => void
  ) => {
    if (!telegramId || !window.Telegram?.WebApp) {
      alert("❗ يرجى فتح التطبيق داخل تليجرام");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // إنشاء payload يحتوي على بيانات الاشتراك
      const payload = JSON.stringify({
        planId,
        userId: telegramId
      });

      // إرسال الفاتورة مباشرة عبر Telegram WebApp
      window.Telegram.WebApp.openInvoice(
        {
          chat_id: telegramId,
          title: "اشتراك VIP",
          description: "اشتراك شهري في الخدمة المميزة",
          currency: "XTR",
          prices: [{ label: "الاشتراك", amount: price * 100 }], // 100 نجمة = 1 دولار
          payload: payload,
          provider_token: "" // لا حاجة لـ provider_token مع نجوم تليجرام
        },
        (status) => {
          if (status === 'paid') {
            console.log("✅ تم الدفع بنجاح");
            onSuccess();
          } else {
            console.warn(`❌ حالة الدفع: ${status}`);
          }
        }
      );

    } catch (error) {
      console.error("❌ خطأ في الدفع:", error);
      setError(error instanceof Error ? error.message : "خطأ غير متوقع");
      alert("فشلت عملية الدفع، يرجى المحاولة لاحقًا");
    } finally {
      setLoading(false);
    }
  };

  return {
    handleTelegramStarsPayment,
    paymentState: {
      loading,
      error,
      resetError: () => setError(null)
    }
  };
};