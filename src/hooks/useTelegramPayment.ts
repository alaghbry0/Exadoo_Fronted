'use client'
import { useState } from "react";
import { useTelegram } from "../context/TelegramContext";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://exadoo.onrender.com";

export const useTelegramPayment = () => {
  const { telegramId } = useTelegram();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTelegramStarsPayment = async (subscriptionId: number, price: string, onSuccess: () => void) => {
    if (!telegramId) {
      alert("❌ لم يتم التعرف على معرف Telegram. تأكد من أنك داخل التطبيق.");
      return;
    }

    if (!window.Telegram?.WebApp) {
      alert("❌ لا يمكن الدفع إلا داخل Telegram Mini App.");
      return;
    }

    try {
      const confirm = await window.Telegram.WebApp.showConfirm(
        `⚡ هل تريد شراء اشتراك مقابل ${price} نجمة؟`
      );

      if (!confirm) {
        console.warn("❌ تم إلغاء الدفع.");
        return;
      }

      console.log("🔄 بدء الدفع باستخدام Telegram Stars...");
      setLoading(true);

      const response = await fetch(`${BACKEND_URL}/api/payments/telegram-stars`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegram_id: telegramId,
          subscription_id: subscriptionId,
          amount: parseFloat(price),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(`❌ فشل الدفع: ${data.error || "خطأ غير معروف"}`);
      }

      console.log("✅ الدفع ناجح! سيتم تفعيل الاشتراك.");
      alert("✅ تم شراء الاشتراك بنجاح!");
      onSuccess(); // ✅ إغلاق النافذة بعد نجاح الدفع

    } catch (error) {
      console.error("❌ خطأ أثناء الدفع:", error);
      alert("❌ فشل الدفع، الرجاء المحاولة لاحقًا.");
      setError(error instanceof Error ? error.message : "خطأ غير معروف");
    } finally {
      setLoading(false);
    }
  };

  return { handleTelegramStarsPayment, loading, error };
};
