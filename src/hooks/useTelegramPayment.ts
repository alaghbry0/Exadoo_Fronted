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
    const handleInvoiceClosed = () => {
      setLoading(false);

      // ✅ جلب حالة الدفع من Telegram WebApp
      const status = window.Telegram?.WebApp?.LastInvoiceStatus as "paid" | "cancelled" | "failed" | undefined;

      if (status) {
        setPaymentStatus(status);

        if (status === 'paid' && onSuccessCallback) {
          console.log("✅ استدعاء onSuccess بعد الدفع الناجح");
          onSuccessCallback();
          setOnSuccessCallback(null); // ✅ إزالة المرجع بعد التنفيذ
        } else {
          console.warn(`❌ الدفع لم يكتمل: ${status}`);
          setError(`فشلت عملية الدفع (${status})`);
        }
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

      // ✅ استدعاء `openInvoice` مباشرة بدون الحاجة إلى `invoice_url`
      window.Telegram.WebApp.openInvoice({
        chat_id: telegramId,
        title: "اشتراك VIP",
        description: "اشتراك شهري في الخدمة المميزة",
        currency: "XTR",
        prices: [{ label: "الاشتراك", amount: price * 100 }],
        payload: payload,
        provider_token: process.env.NEXT_PUBLIC_TELEGRAM_PROVIDER_TOKEN || ""
      }, () => {
        console.log("✅ تم إرسال الفاتورة، بانتظار الدفع...");
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
