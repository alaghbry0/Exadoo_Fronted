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

    const handleInvoiceClosed = async () => {
      setLoading(false);
      console.log("🔄 نافذة الفاتورة أُغلقت، التحقق من الدفع...");

      if (paymentStatus === "pending") {
        console.warn("❌ الدفع فشل أو تم إلغاؤه.");
        setError("فشلت عملية الدفع أو تم إلغاؤها.");
        setPaymentStatus("failed");
      } else if (paymentStatus === "paid") {
        console.log("✅ تم تأكيد الدفع!");
        if (onSuccessCallback) {
          onSuccessCallback();
          setOnSuccessCallback(null);
        }
      }
    };

    tgWebApp?.onEvent?.("invoiceClosed", handleInvoiceClosed);
    return () => {
      tgWebApp?.offEvent?.("invoiceClosed", handleInvoiceClosed);
    };
  }, [onSuccessCallback, paymentStatus]);

  const handleTelegramStarsPayment = useCallback(async (
    planId: number,
    price: number,
    onSuccess: () => void
  ) => {
    if (typeof window === "undefined" || !window.Telegram?.WebApp) {
      alert("❗ يرجى فتح التطبيق داخل تليجرام");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setPaymentStatus('pending');
      setOnSuccessCallback(() => onSuccess);

      console.log("🔹 إرسال طلب لإنشاء الفاتورة...");
      const invoice_url = await fetchWithRetry("/api/create-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_WEBHOOK_SECRET}`
        },
        body: JSON.stringify({ telegram_id: telegramId, plan_id: planId, amount: price }),
      });

      if (!invoice_url) throw new Error("❌ فشل في جلب رابط الفاتورة!");

      console.log(`🔗 فتح الفاتورة: ${invoice_url}`);

      // ✅ التحقق من وجود `window.Telegram` قبل استدعاء `openInvoice`
      if (typeof window !== "undefined" && window.Telegram?.WebApp?.openInvoice) {
        window.Telegram.WebApp.openInvoice(invoice_url, (status: string) => {
          console.log(`🔄 حالة الدفع: ${status}`);

          if (status === "paid") {
            console.log("✅ تم الدفع بنجاح");
            setPaymentStatus("paid");
            onSuccess();
          } else {
            console.warn(`❌ الدفع غير ناجح (${status})`);
            setError(`فشلت عملية الدفع (${status})`);
            setPaymentStatus("failed");

            // إعادة المحاولة بعد 5 ثوانٍ إذا كان الدفع "pending"
            if (status === "pending") {
              setTimeout(() => {
                if (window.Telegram?.WebApp?.openInvoice) {
                  console.log("🔄 إعادة محاولة فتح الفاتورة...");
                  window.Telegram.WebApp.openInvoice(invoice_url, (retryStatus: string) => {
                    console.log(`🔄 حالة الدفع بعد إعادة المحاولة: ${retryStatus}`);
                    if (retryStatus === "paid") {
                      console.log("✅ تم الدفع بنجاح بعد إعادة المحاولة!");
                      setPaymentStatus("paid");
                      onSuccess();
                    }
                  });
                }
              }, 5000);
            }
          }
        });
      } else {
        throw new Error("❌ لا يمكن فتح الفاتورة، Telegram WebApp غير مدعوم على هذا الجهاز!");
      }

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

/**
 * 🔁 دالة `fetchWithRetry` لإعادة المحاولة عند فشل الاتصال.
 */
async function fetchWithRetry(url: string, options: RequestInit, retries = 3, delay = 2000): Promise<string | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        console.warn(`⚠️ محاولة ${attempt}/${retries} فشلت: ${response.statusText}`);
      } else {
        const { invoice_url } = await response.json();
        if (invoice_url) return invoice_url;
      }
    } catch (error) {
      console.error(`❌ خطأ أثناء المحاولة ${attempt}/${retries}:`, error);
    }

    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  console.error("🚨 جميع محاولات إنشاء الفاتورة فشلت!");
  return null;
}
