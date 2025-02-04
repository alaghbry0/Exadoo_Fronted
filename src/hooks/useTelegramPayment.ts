'use client'
import { useState, useEffect, useCallback } from "react";
import { useTelegram } from "../context/TelegramContext";

export const useTelegramPayment = () => {
  const { telegramId } = useTelegram();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'failed' | 'cancelled' | null>(null);
  const [onSuccessCallback, setOnSuccessCallback] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.Telegram?.WebApp) return;

    const tgWebApp = window.Telegram.WebApp;

    // ✅ متابعة الدفع بعد إغلاق نافذة الفاتورة
    const handleInvoiceClosed = (status: "paid" | "cancelled" | "failed") => {
      setLoading(false);

      if (status === 'paid' && onSuccessCallback) {
        console.log("✅ استدعاء onSuccess بعد الدفع الناجح");
        onSuccessCallback();
        setOnSuccessCallback(null); // ✅ إزالة المرجع بعد التنفيذ
      } else {
        console.warn(`❌ الدفع لم يكتمل: ${status}`);
        setError(`فشلت عملية الدفع (${status})`);
        setPaymentStatus(status);
      }
    };

    tgWebApp?.onEvent?.("invoiceClosed", handleInvoiceClosed);
    return () => {
      tgWebApp?.offEvent?.("invoiceClosed", handleInvoiceClosed);
    };
  }, [onSuccessCallback]);

  const handleTelegramStarsPayment = useCallback(async (
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
      setPaymentStatus('pending');
      setOnSuccessCallback(() => onSuccess); // ✅ حفظ `onSuccess` للاستخدام لاحقًا

      const payload = JSON.stringify({
        planId,
        userId: telegramId
      });

      // ✅ استدعاء `openInvoice` مباشرة دون الحاجة إلى API خارجي
      window.Telegram.WebApp.openInvoice({
        chat_id: telegramId,
        title: "اشتراك VIP",
        description: "اشتراك شهري في الخدمة المميزة",
        currency: "XTR",
        prices: [{ label: "الاشتراك", amount: price * 100 }],
        payload: payload,
        provider_token: process.env.NEXT_PUBLIC_TELEGRAM_PROVIDER_TOKEN || ""
      }, (status: string) => {
        console.log("✅ حالة الدفع:", status);
        setPaymentStatus(status as "paid" | "cancelled" | "failed");
      });

    } catch (error) {
      console.error("❌ خطأ في الدفع:", error);
      setError(error instanceof Error ? error.message : "خطأ غير متوقع");
      setPaymentStatus('failed');
      alert("فشلت عملية الدفع، يرجى المحاولة لاحقًا");
    } finally {
      setLoading(false);
    }
  }, [telegramId]);

  return {
    handleTelegramStarsPayment,
    paymentState: {
      loading,
      error,
      paymentStatus,
      resetError: () => setError(null),
      resetPaymentStatus: () => setPaymentStatus(null)
    }
  };
};
