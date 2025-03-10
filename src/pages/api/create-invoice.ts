import { NextApiRequest, NextApiResponse } from "next";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  console.log("📥 استلام طلب لإنشاء الفاتورة:", req.body);

  // استخراج المتغيرات من body الطلب
  const { telegram_id, plan_id, amount, payment_token, full_name, username } = req.body;

  // التحقق من وجود الحقول الأساسية المطلوبة
  if (!payment_token || !telegram_id || !plan_id || amount === undefined) {
    console.error("❌ بيانات ناقصة:", { payment_token, telegram_id, plan_id, amount });
    return res.status(400).json({ error: "Missing required fields" });
  }

  // التحقق من الحقول الجديدة الخاصة بالمستخدم
  if (!full_name || !username) {
    console.error("❌ بيانات ناقصة:", { full_name, username });
    return res.status(400).json({ error: "Missing user details" });
  }

  const numericTelegramId = Number(telegram_id);
  const numericAmount = Number(amount);

  if (isNaN(numericTelegramId)) {
    console.error("❌ telegram_id غير صحيح:", telegram_id);
    return res.status(400).json({ error: "Invalid telegram_id" });
  }

  if (isNaN(numericAmount)) {
    console.error("❌ amount غير صحيح:", amount);
    return res.status(400).json({ error: "Invalid amount" });
  }

  if (!TELEGRAM_BOT_TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN غير مضبوط");
    return res.status(500).json({ error: "Internal server error" });
  }

  try {
    // إنشاء payload مع البيانات الجديدة
    const payload = JSON.stringify({
  planId: plan_id,
  userId: numericTelegramId,
  paymentToken: payment_token,
  fullName: full_name,
  username: username
});
    // تحويل المبلغ إلى صيغة Telegram الصحيحة (سنتات)
    const invoiceAmount = Math.round(numericAmount * 100);

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
        description: `تجديد اشتراك لمدة ${plan_id} أيام للمستخدم ${full_name} (@${username})`,
        payload: payload,
        currency: "XTR",
        prices: [{
          label: "الاشتراك المميز",
          amount: invoiceAmount
        }],
        provider_data: {
  payment_token: payment_token,
  full_name: full_name,
  username: username // توحيد اسم الحقل مع ما يطلبه Telegram
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
