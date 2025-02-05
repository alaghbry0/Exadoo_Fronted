// useTelegramPayment.ts
'use client';
import { useState, useCallback } from "react";
import { useTelegram } from "../context/TelegramContext";

export const useTelegramPayment = () => {
  const { telegramId } = useTelegram();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'failed' | null>(null);

  const handleTelegramStarsPayment = useCallback(async (planId: number, price: number) => {
    if (typeof window === "undefined" || !window.Telegram?.WebApp) {
      alert("❗ يرجى فتح التطبيق داخل تليجرام");
      return;
    }

    if (!telegramId || !planId) {
      setError("❌ بيانات المستخدم أو الخطة غير صحيحة!");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setPaymentStatus('pending');

      const response = await fetch("/api/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegram_id: telegramId, plan_id: planId, amount: price })
      });

      const data = await response.json();
      if (!response.ok || !data.invoice_url) {
        throw new Error("❌ فشل في إنشاء الفاتورة!");
      }

    } catch (error: any) {
      setError(error.message || "❌ خطأ غير متوقع");
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  }, [telegramId]);

  async function sendPaymentToWebhook(telegramId: number, planId: number, invoiceUrl: string) {
    try {
      const response = await fetch("/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Telegram-Bot-Api-Secret-Token": process.env.NEXT_PUBLIC_WEBHOOK_SECRET || ""
        },
        body: JSON.stringify({
          telegram_id: telegramId,
          subscription_type_id: planId,
          payment_id: invoiceUrl
        })
      });

      if (!response.ok) {
        throw new Error("❌ فشل إرسال تأكيد الدفع!");
      }
    } catch (error: any) {
      setError(error.message || "❌ حدث خطأ أثناء إرسال تأكيد الدفع.");
    }
  }

  return {
    handleTelegramStarsPayment,
    paymentState: { loading, error, paymentStatus, resetError: () => setError(null) }
  };
};
