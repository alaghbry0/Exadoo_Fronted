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

    const handleInvoiceClosed = () => {
      setLoading(false);
      console.log("🔄 نافذة الفاتورة أُغلقت، التحقق من الدفع...");

      if (onSuccessCallback) {
        console.log("✅ استدعاء onSuccess بعد إغلاق الفاتورة");
        onSuccessCallback();
        setOnSuccessCallback(null);
        setPaymentStatus('paid');
      } else {
        console.warn("❌ لم يتم تأكيد الدفع، قد يكون المستخدم ألغى العملية.");
        setPaymentStatus('failed');
        setError("عملية الدفع لم تكتمل، يرجى المحاولة مرة أخرى.");
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
      setOnSuccessCallback(() => onSuccess);

      const response = await fetch("/api/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegram_id: telegramId, plan_id: planId, amount: price }),
      });

      if (!response.ok) {
        throw new Error(`❌ فشل في إنشاء الفاتورة: ${await response.text()}`);
      }

      const { invoice_url } = await response.json();

      console.log(`🔗 فتح الفاتورة: ${invoice_url}`);

      // ✅ فتح الفاتورة باستخدام `openInvoice`
      window.Telegram.WebApp.openInvoice?.(invoice_url, (status) => {
        if (status === "paid") {
          console.log("✅ تم الدفع بنجاح");
          onSuccess();
        } else {
          console.warn(`❌ حالة الدفع: ${status}`);
          setError(`فشلت عملية الدفع (${status})`);
        }
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
