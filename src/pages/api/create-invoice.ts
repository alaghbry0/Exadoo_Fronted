import { NextApiRequest, NextApiResponse } from "next";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  console.log("📥 استلام طلب لإنشاء الفاتورة:", req.body);

  // استخراج payment_token من body الطلب
  const { telegram_id, plan_id, amount, payment_token } = req.body;

  // التحقق من وجود جميع الحقول المطلوبة
  if (!payment_token || !telegram_id || !plan_id || amount === undefined) {
    console.error("❌ بيانات ناقصة:", { payment_token, telegram_id, plan_id, amount });
    return res.status(400).json({ error: "Missing required fields" });
  }

  const numericTelegramId = Number(telegram_id);
  const numericAmount = Number(amount);

  if (isNaN(numericTelegramId)) { // <-- تم تصحيحه
  console.error("❌ telegram_id غير صحيح:", telegram_id);
  return res.status(400).json({ error: "Invalid telegram_id" });
}

if (isNaN(numericAmount)) { // <-- تم تصحيحه
  console.error("❌ amount غير صحيح:", amount);
  return res.status(400).json({ error: "Invalid amount" });
}

  if (!TELEGRAM_BOT_TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN غير مضبوط");
    return res.status(500).json({ error: "Internal server error" });
  }

  try {
    // إنشاء payload مع payment_token
    const payload = JSON.stringify({
      planId: plan_id,
      userId: numericTelegramId,
      paymentToken: payment_token
    });

    // تحويل المبلغ إلى صيغة Telegram الصحيحة (سنتات)
    const invoiceAmount = Math.round(numericAmount ); // تحويل إلى سنتات

    console.log("🔗 بيانات الفاتورة:", {
      payment_token,
      telegram_id: numericTelegramId,
      plan_id,
      amount: numericAmount
    });

    // إرسال طلب لإنشاء الفاتورة
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/createInvoiceLink`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "اشتراك VIP",
        description: `تجديد اشتراك لمدة ${plan_id} أيام`,
        payload: payload,
        currency: "XTR",
        prices: [{
          label: "الاشتراك المميز",
          amount: invoiceAmount
        }],
        provider_data: {
          payment_token: payment_token // إضافة payment_token كبيانات إضافية
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ خطأ من Telegram API:", errorText);
      return res.status(502).json({
        error: "فشل الاتصال بخدمة الدفع",
        details: errorText
      });
    }

    const responseData = await response.json();

    if (!responseData.ok || !responseData.result) {
      console.error("❌ فشل في إنشاء الفاتورة:", responseData.description);
      return res.status(500).json({
        error: "فشل في إنشاء الفاتورة",
        details: responseData.description
      });
    }

    console.log("✅ فاتورة تم إنشاؤها بنجاح:", {
      payment_token,
      invoice_url: responseData.result
    });

    return res.status(200).json({
      invoice_url: responseData.result,
      payment_token // إرجاع payment_token للتأكيد
    });

  } catch (error) {
    console.error("❌ خطأ غير متوقع:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}