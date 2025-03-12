'use client';
import { useState, useCallback } from "react";
import { useTelegram } from "../context/TelegramContext";

type PaymentResponse = {
  paymentToken?: string;
  error?: string;
};

export const useTelegramPayment = () => {
  const { telegramId } = useTelegram();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'failed' | 'processing' | null>(null);

  const handleTelegramStarsPayment = useCallback(async (planId: number, starsPrice: number): Promise<PaymentResponse> => {
    if (typeof window === "undefined" || !window.Telegram?.WebApp) {
      alert("❗ يرجى فتح التطبيق داخل تليجرام");
      return { error: "Telegram WebApp not available" };
    }

    if (!telegramId || !planId) {
      const errorMsg = "❌ بيانات المستخدم أو الخطة غير صحيحة!";
      setError(errorMsg);
      return { error: errorMsg };
    }

    try {
      setLoading(true);
      setError(null);
      setPaymentStatus('pending');

      // 1. إنشاء payment_token باستخدام عنوان الباك إند من متغيرات البيئة
      const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/create-telegram-payment-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({  telegramId })
      });

      if (!tokenResponse.ok) {
        throw new Error('❌ فشل في إنشاء رمز الدفع');
      }

      const { payment_token } = await tokenResponse.json();
      if (!payment_token) {
        throw new Error('❌ لم يتم استلام رمز الدفع من الخادم');
      }

      // 2. إنشاء الفاتورة
     const invoiceResponse = await fetch("/api/create-invoice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      telegram_id: Number(telegramId),
      plan_id: planId, // هذا هو معرف الخطة الصحيح
      amount: starsPrice, // السعر بالنجوم
      payment_token
    })
  });

      if (!invoiceResponse.ok) {
        throw new Error("❌ فشل في إنشاء الفاتورة!");
      }

      const invoiceData = await invoiceResponse.json();
      if (!invoiceData.invoice_url) {
        throw new Error("❌ رابط الفاتورة غير موجود في الاستجابة");
      }

      // 3. فتح واجهة الدفع
      return new Promise<PaymentResponse>((resolve) => {
        // التحقق من وجود الدالة قبل استخدامها
        if (!window.Telegram?.WebApp?.openInvoice) {
          const errorMsg = "❌ نظام الدفع غير متاح";
          setError(errorMsg);
          resolve({ error: errorMsg });
          return;
        }

        // استدعاء دالة openInvoice مرة واحدة
        window.Telegram.WebApp.openInvoice(invoiceData.invoice_url, (status: string) => {
          if (status === "paid") {
            setPaymentStatus("processing");
            console.log("✅ تم الدفع بنجاح!");
            resolve({ paymentToken: payment_token });
          } else {
            setPaymentStatus("failed");
            const errorMsg = `فشلت العملية (${status})`;
            setError(errorMsg);
            resolve({ error: errorMsg });
          }
        });
      });

    } catch (error: unknown) {
      setPaymentStatus('failed');
      const errorMsg = error instanceof Error
        ? error.message
        : "❌ حدث خطأ غير معروف";
      setError(errorMsg);
      return { error: errorMsg };
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
      resetError: () => setError(null)
    }
  };
};
