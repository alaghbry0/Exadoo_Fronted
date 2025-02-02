// useTelegramPayment.ts
'use client'
import { useState, useEffect } from "react";
import { useTelegram } from "../context/TelegramContext";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://exadoo.onrender.com";

export const useTelegramPayment = () => {
  const { telegramId } = useTelegram();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTelegramStarsPayment = async (
    subscriptionId: number,
    price: number,
    onSuccess: () => void
  ) => {
    if (!telegramId || !window.Telegram?.WebApp) {
      alert("❌ يُرجى فتح التطبيق داخل Telegram");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. إنشاء فاتورة دفع عبر الخادم
      const invoiceResponse = await fetch(`${BACKEND_URL}/api/payments/create-invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegram_id: telegramId,
          subscription_id: subscriptionId,
          amount: price,
        }),
      });

      if (!invoiceResponse.ok) {
        throw new Error("فشل في إنشاء الفاتورة");
      }

      const invoiceData = await invoiceResponse.json();

      // 2. عرض واجهة الدفع الخاصة بتليجرام
      window.Telegram.WebApp.openInvoice(invoiceData.invoice_link, (status) => {
        if (status === 'paid') {
          console.log("✅ الدفع ناجح!");
          onSuccess();
        } else {
          console.warn("❌ تم إلغاء الدفع");
        }
      });

    } catch (error) {
      console.error("❌ خطأ في الدفع:", error);
      setError(error instanceof Error ? error.message : "خطأ غير معروف");
    } finally {
      setLoading(false);
    }
  };

  return { handleTelegramStarsPayment, loading, error };
};