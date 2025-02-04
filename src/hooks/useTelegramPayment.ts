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

      if (paymentStatus === 'pending') {
        console.warn("❌ الدفع فشل أو تم إلغاؤه.");
        setError("فشلت عملية الدفع أو تم إلغاؤها.");
        setPaymentStatus('failed');
      } else if (paymentStatus === 'paid' && onSuccessCallback) {
        console.log("✅ استدعاء onSuccess بعد الدفع الناجح");
        onSuccessCallback();
        setOnSuccessCallback(null); // ✅ إزالة المرجع بعد التنفيذ
      }
    };

    tgWebApp?.onEvent?.("invoiceClosed", handleInvoiceClosed);
    return () => {
      tgWebApp?.offEvent?.("invoiceClosed", handleInvoiceClosed);
    };
  }, [paymentStatus, onSuccessCallback]);

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
      setOnSuccessCallback(() => onSuccess); // ✅ حفظ الـ `callback` للاستخدام بعد نجاح الدفع

      // ✅ إنشاء بيانات الدفع مباشرة
      const payload = JSON.stringify({
        planId: planId,
        userId: telegramId
      });

      const invoiceUrl = `tg://openinvoice?amount=${price * 100}&payload=${encodeURIComponent(payload)}`;

      console.log(`✅ فتح نافذة الدفع: ${invoiceUrl}`);

      // ✅ استدعاء الدفع مباشرة بدون API خارجي
      window.Telegram.WebApp.openInvoice?.(invoiceUrl, () => {
        console.log("✅ تمت معالجة الدفع، في انتظار رد تليجرام...");
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
