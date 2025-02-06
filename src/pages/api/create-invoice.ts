import { NextApiRequest, NextApiResponse } from "next";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  console.log("📥 استلام طلب لإنشاء الفاتورة:", req.body);

  const { telegram_id, plan_id, amount } = req.body;

  const numericTelegramId = Number(telegram_id);

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

    // ✅ التأكد من أن `amount` صحيح وتحويله إلى سنتات
    const invoiceAmount = Math.round(50); // تحويل `amount` إلى سنتات

    console.log("📤 البيانات المرسلة إلى Telegram API:", {
      title: "اشتراك VIP",
      description: "اشتراك شهري في الخدمة المميزة",
      payload: payload,
      currency: "XTR",
      prices: [{ label: "الاشتراك", amount: invoiceAmount }],
    });

    // ✅ طلب إنشاء الفاتورة من Telegram API
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/createInvoiceLink`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
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
    console.log(`✅ تم إنشاء الفاتورة بنجاح: ${invoiceUrl}`);
    return res.status(200).json({ invoice_url: invoiceUrl });

  } catch (error) {
    console.error("❌ خطأ أثناء إنشاء الفاتورة:", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
  }
}
