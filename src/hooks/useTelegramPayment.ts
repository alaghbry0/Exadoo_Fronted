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

      console.log("🔄 نافذة الفاتورة أُغلقت، التحقق من الدفع...");

      if (onSuccessCallback) {
        console.log("✅ استدعاء onSuccess بعد إغلاق الفاتورة");
        onSuccessCallback();
        setOnSuccessCallback(null); // ✅ تنظيف المرجع بعد التنفيذ
        setPaymentStatus('paid'); // ✅ تحديد حالة الدفع على أنها ناجحة
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

    // ✅ التحقق من أن openInvoice متاح قبل استدعائه
    if (!window.Telegram.WebApp.openInvoice) {
      console.error("❌ openInvoice غير متاح في Telegram WebApp!");
      setError("خدمة الدفع غير مدعومة في هذا الجهاز أو المتصفح.");
      setPaymentStatus('failed');
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

      // ✅ استدعاء `openInvoice` فقط إذا كان معرفًا
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
