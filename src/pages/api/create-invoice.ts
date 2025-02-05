import { NextApiRequest, NextApiResponse } from "next";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { telegram_id, plan_id, amount } = req.body;

  if (!telegram_id || !plan_id || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!TELEGRAM_BOT_TOKEN) {
    return res.status(500).json({ error: "Missing TELEGRAM_BOT_TOKEN environment variable" });
  }

  try {
    console.log(`🔹 إنشاء فاتورة لـ ${telegram_id} - الخطة ${plan_id} - المبلغ ${amount}`);

    const payload = JSON.stringify({ planId: plan_id, userId: telegram_id });

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/createInvoiceLink`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "اشتراك VIP",
        description: "اشتراك شهري في الخدمة المميزة",
        payload: payload,
        currency: "XTR",
        prices: [{ label: "الاشتراك", amount: amount * 100 }], // تحويل إلى سنتات
        provider_data: JSON.stringify({ max_tip_amount: 0 }),
      }),
    });

    const data = await response.json();
    console.log("🔹 استجابة API:", data);

    if (!data.ok) {
      throw new Error(`❌ فشل في إنشاء الفاتورة: ${data.description}`);
    }

    const invoiceUrl = data.result;

    if (!invoiceUrl.startsWith("https://t.me/invoice/")) {
      console.error(`❌ رابط الفاتورة غير مدعوم: ${invoiceUrl}`);
      throw new Error("❌ رابط الفاتورة غير صالح، تحقق من إعدادات البوت.");
    }

    console.log(`✅ تم إنشاء الفاتورة بنجاح: ${invoiceUrl}`);
    return res.status(200).json({ invoice_url: invoiceUrl });

  } catch (error) {
    console.error("❌ خطأ أثناء إنشاء الفاتورة:", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
  }
}