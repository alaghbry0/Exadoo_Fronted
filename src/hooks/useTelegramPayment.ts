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
        body: JSON.stringify({ telegram_id: Number(telegramId), plan_id: planId, amount: price })
      });

      const data = await response.json();
      if (!response.ok || !data.invoice_url) {
        throw new Error("❌ فشل في إنشاء الفاتورة!");
      }

      if (window.Telegram?.WebApp?.openInvoice) {
        window.Telegram.WebApp.openInvoice(data.invoice_url, async (status: string) => {
          if (status === "paid") {
            setPaymentStatus("paid");
            console.log("✅ تم الدفع بنجاح! سيتم معالجة الدفع تلقائيًا بواسطة البوت.");
          } else {
            setPaymentStatus("failed");
            setError(`فشلت عملية الدفع (${status})`);
          }
        });
      } else {
        throw new Error("❌ `openInvoice` غير مدعومة على هذا الجهاز!");
      }

    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || "❌ خطأ غير متوقع");
      } else {
        setError("❌ حدث خطأ غير معروف");
      }
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  }, [telegramId]);

  return {
    handleTelegramStarsPayment,
    paymentState: { loading, error, paymentStatus, resetError: () => setError(null) }
  };
};
