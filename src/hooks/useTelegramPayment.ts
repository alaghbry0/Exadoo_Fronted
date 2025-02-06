'use client';
import { useState, useCallback } from "react";
import { useTelegram } from "../context/TelegramContext";

export const useTelegramPayment = () => {
  const { telegramId } = useTelegram();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'failed' | null>(null);

  // ✅ تحميل `WEBHOOK_SECRET` من متغيرات البيئة
  const webhookSecret = process.env.NEXT_PUBLIC_WEBHOOK_SECRET || "";
  console.log("🔹 تحميل WEBHOOK_SECRET:", webhookSecret); // ✅ للتحقق من تحميله بشكل صحيح

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

            // ✅ تأكيد الدفع وإرساله إلى الـ Webhook
            await sendPaymentToWebhook(Number(telegramId), planId, data.invoice_url);
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

  // ✅ تصحيح `sendPaymentToWebhook` وإرسال البيانات بشكل صحيح إلى Webhook
  async function sendPaymentToWebhook(telegramId: number, planId: number, paymentId: string) {
  try {
    console.log("📤 إرسال تأكيد الدفع إلى /webhook...", {
      telegramId,
      planId,
      paymentId,
      webhookSecret
    });

    const response = await fetch("/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Telegram-Bot-Api-Secret-Token": webhookSecret // ✅ التأكد من تمرير التوكن السري
      },
      body: JSON.stringify({
        message: {
          successful_payment: {
            telegram_payment_charge_id: paymentId,
            total_amount: planId * 100, // تحويل السعر إلى سنتات
            invoice_payload: JSON.stringify({ userId: telegramId, planId: planId })
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ خطأ في إرسال تأكيد الدفع:", errorText);
      throw new Error("❌ فشل إرسال تأكيد الدفع!");
    }

    console.log("✅ تم إرسال تأكيد الدفع بنجاح!");
  } catch (error: unknown) {
    console.error("❌ خطأ أثناء إرسال تأكيد الدفع:", error);
  }
}



  return {
    handleTelegramStarsPayment,
    paymentState: { loading, error, paymentStatus, resetError: () => setError(null) }
  };
};
