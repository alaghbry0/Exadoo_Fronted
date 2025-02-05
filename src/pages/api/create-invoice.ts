import { NextApiRequest, NextApiResponse } from "next";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  console.log("📥 استلام طلب لإنشاء الفاتورة:", req.body);
  console.log("ℹ️ نوع البيانات المستلمة:", {
    telegram_id: typeof req.body.telegram_id,
    plan_id: typeof req.body.plan_id,
    amount: typeof req.body.amount,
  });

  const { telegram_id, plan_id, amount } = req.body;

  // ✅ تحويل `telegram_id` إلى رقم لتجنب الأخطاء
  const numericTelegramId = Number(telegram_id);

  // ✅ التحقق من البيانات قبل تنفيذ أي طلب
  if (!numericTelegramId || !plan_id || amount === undefined || amount === null || isNaN(amount)) {
    console.error("❌ بيانات غير مكتملة أو `amount` غير صالح:", { numericTelegramId, plan_id, amount });
    return res.status(400).json({ error: "Missing or invalid required fields" });
  }

  if (!TELEGRAM_BOT_TOKEN) {
    console.error("❌ `TELEGRAM_BOT_TOKEN` غير مضبوط.");
    return res.status(500).json({ error: "Missing TELEGRAM_BOT_TOKEN environment variable" });
  }

  try {
    console.log(`🔹 إنشاء فاتورة لـ ${numericTelegramId} - الخطة ${plan_id} - المبلغ ${amount}`);

    const payload = JSON.stringify({ planId: plan_id, userId: numericTelegramId });

    const invoiceAmount = 1; // ❗️ جرب `1` أولاً لاختبار ما إذا كانت `amount * 100` هي السبب

    console.log("📤 البيانات المرسلة إلى Telegram API:", {
      title: "اشتراك VIP",
      description: "اشتراك شهري في الخدمة المميزة",
      payload: payload,
      currency: "XTR",
      prices: [{ label: "الاشتراك", amount: invoiceAmount }],
    });

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/createInvoiceLink`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "اشتراك VIP",
        description: "اشتراك شهري في الخدمة المميزة",
        payload: payload,
        currency: "XTR",
        prices: [{ label: "الاشتراك", amount: invoiceAmount }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ خطأ في الاتصال بـ Telegram API:", errorText);
      return res.status(500).json({ error: "Failed to connect to Telegram API", details: errorText });
    }

    const data = await response.json();
    console.log("🔹 استجابة API من تليجرام:", JSON.stringify(data, null, 2));

    if (!data.ok) {
      console.error(`❌ فشل في إنشاء الفاتورة: ${data.description}`);
      return res.status(500).json({ error: `Telegram API error: ${data.description}` });
    }

    const invoiceUrl = data.result;

    if (!invoiceUrl.startsWith("https://t.me/invoice/") && !invoiceUrl.startsWith("https://t.me/$")) {
      console.error(`❌ رابط الفاتورة غير مدعوم: ${invoiceUrl}`);
      return res.status(500).json({ error: "Invalid invoice URL from Telegram API" });
    }

    console.log(`✅ تم إنشاء الفاتورة بنجاح: ${invoiceUrl}`);
    return res.status(200).json({ invoice_url: invoiceUrl });

  } catch (error) {
    console.error("❌ خطأ أثناء إنشاء الفاتورة:", error);

    if (error instanceof SyntaxError) {
      return res.status(400).json({ error: "Invalid JSON received" });
    }

    return res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
  }
}
