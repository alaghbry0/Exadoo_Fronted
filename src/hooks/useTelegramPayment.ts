'use client'
import { useState, useEffect, useCallback } from "react";
import { useTelegram } from "../context/TelegramContext";

export const useTelegramPayment = () => {
  const { telegramId } = useTelegram();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'failed' | 'cancelled' | null>(null);

  useEffect(() => {
    if (!window.Telegram?.WebApp) return;

    // ✅ متابعة الدفع بعد إغلاق نافذة الفاتورة
    const handleInvoiceClosed = (event: { status: 'paid' | 'cancelled' | 'failed' }) => {
      setLoading(false);

      if (event.status === 'paid') {
        console.log("✅ الدفع تم بنجاح!");
        setPaymentStatus('paid');
      } else {
        console.warn(`❌ الدفع فشل: ${event.status}`);
        setError(`فشلت عملية الدفع (${event.status})`);
        setPaymentStatus(event.status);
      }
    };

    window.Telegram.WebApp.onEvent("invoiceClosed", handleInvoiceClosed);
    return () => window.Telegram.WebApp.offEvent("invoiceClosed", handleInvoiceClosed);
  }, []);

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

      const payload = JSON.stringify({
        planId,
        userId: telegramId
      });

      const providerToken = process.env.NEXT_PUBLIC_TELEGRAM_PROVIDER_TOKEN; // ✅ استخدام المتغير البيئي

      if (!providerToken) {
        throw new Error("❌ Telegram Provider Token غير مضبوط!");
      }

      window.Telegram.WebApp.openInvoice(
        {
          chat_id: telegramId,
          title: "اشتراك VIP",
          description: "اشتراك شهري في الخدمة المميزة",
          currency: "XTR",
          prices: [{ label: "الاشتراك", amount: price * 100 }],
          payload: payload,
          provider_token: providerToken // ✅ حماية المفتاح
        },
        (status) => {
          if (status === 'paid') {
            console.log("✅ تم الدفع بنجاح");
            setPaymentStatus('paid');
            onSuccess();
          } else {
            console.warn(`❌ حالة الدفع: ${status}`);
            setPaymentStatus(status);
            setError(`فشلت عملية الدفع (${status})`);
          }
        }
      );

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
      resetPaymentStatus: () => setPaymentStatus(null) // ✅ إعادة ضبط حالة الدفع
    }
  };
};
