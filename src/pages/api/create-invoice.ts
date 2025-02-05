import { NextApiRequest, NextApiResponse } from "next";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { telegram_id, plan_id, amount } = req.body;

  // ✅ تحقق من أن جميع البيانات موجودة
  if (!telegram_id || !plan_id || !amount) {
    console.error("❌ بيانات غير مكتملة:", { telegram_id, plan_id, amount });
    return res.status(400).json({ error: "Missing required fields" });
  }

  // ✅ تأكد من وجود مفتاح API الخاص بتليجرام
  if (!TELEGRAM_BOT_TOKEN) {
    console.error("❌ خطأ: TELEGRAM_BOT_TOKEN غير مضبوط في البيئة.");
    return res.status(500).json({ error: "Missing TELEGRAM_BOT_TOKEN environment variable" });
  }

  try {
    console.log(`🔹 إنشاء فاتورة لـ ${telegram_id} - الخطة ${plan_id} - المبلغ ${amount}`);

    const payload = JSON.stringify({ planId: plan_id, userId: telegram_id });

    // ✅ التأكد من أن القيمة المالية يتم إرسالها بشكل صحيح إلى تليجرام
    const invoiceAmount = parseInt((amount * 100).toFixed(0)); // تحويل إلى سنتات وتجنب الأخطاء العشرية

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/createInvoiceLink`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "اشتراك VIP",
        description: "اشتراك شهري في الخدمة المميزة",
        payload: payload,
        currency: "XTR",
        prices: [{ label: "الاشتراك", amount: invoiceAmount }], // تحويل إلى سنتات
        provider_data: JSON.stringify({ max_tip_amount: 0 }),
      }),
    });

    const data = await response.json();
    console.log("🔹 استجابة API من تليجرام:", JSON.stringify(data, null, 2));

    // ✅ تحقق مما إذا كان API تليجرام أعاد خطأ
    if (!data.ok) {
      console.error(`❌ فشل في إنشاء الفاتورة: ${data.description}`);
      return res.status(500).json({ error: `Telegram API error: ${data.description}` });
    }

    const invoiceUrl = data.result;

    // ✅ تأكد من أن رابط الفاتورة صحيح
    if (!invoiceUrl || !invoiceUrl.startsWith("https://t.me/invoice/")) {
      console.error(`❌ رابط الفاتورة غير مدعوم: ${invoiceUrl}`);
      return res.status(500).json({ error: "Invalid invoice URL from Telegram API" });
    }

    console.log(`✅ تم إنشاء الفاتورة بنجاح: ${invoiceUrl}`);
    return res.status(200).json({ invoice_url: invoiceUrl });

  } catch (error) {
    console.error("❌ خطأ أثناء إنشاء الفاتورة:", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
  }
}
