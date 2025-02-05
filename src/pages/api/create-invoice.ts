import { NextApiRequest, NextApiResponse } from "next";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // ✅ طباعة `TELEGRAM_BOT_TOKEN` للتحقق من أنه مضبوط بشكل صحيح
  if (!TELEGRAM_BOT_TOKEN) {
    console.error("❌ خطأ: `TELEGRAM_BOT_TOKEN` غير مضبوط أو غير متاح.");
    return res.status(500).json({ error: "Missing TELEGRAM_BOT_TOKEN environment variable" });
  }

  console.log("✅ `TELEGRAM_BOT_TOKEN` متاح:", TELEGRAM_BOT_TOKEN ? "Yes" : "No");

  // ✅ طباعة بيانات الطلب لمساعدتنا في اكتشاف الأخطاء
  console.log("📥 استلام طلب لإنشاء الفاتورة:", req.body);

  const { telegram_id, plan_id, amount } = req.body;

  // ✅ تحقق من صحة البيانات قبل إرسالها
  if (!telegram_id || !plan_id || amount === undefined || amount === null || isNaN(amount)) {
    console.error("❌ بيانات غير مكتملة أو `amount` غير صالح:", { telegram_id, plan_id, amount });
    return res.status(400).json({ error: "Missing or invalid required fields" });
  }

  try {
    console.log(`🔹 إنشاء فاتورة لـ ${telegram_id} - الخطة ${plan_id} - المبلغ ${amount}`);

    const payload = JSON.stringify({ planId: plan_id, userId: telegram_id });

    // ✅ التأكد من أن `amount` يتم تحويله بشكل صحيح إلى سنتات
    const invoiceAmount = parseInt((amount * 100).toFixed(0));

    // ✅ طباعة البيانات المرسلة إلى تليجرام
    console.log("📤 إرسال البيانات إلى تليجرام:", {
      title: "اشتراك VIP",
      description: "اشتراك شهري في الخدمة المميزة",
      payload: payload,
      currency: "XTR",
      prices: [{ label: "الاشتراك", amount: invoiceAmount }],
      provider_data: JSON.stringify({ max_tip_amount: 0 }),
    });

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

    // ✅ التحقق مما إذا كان `fetch()` فشل قبل تحليل `JSON`
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ خطأ في الاتصال بـ API تليجرام:", errorText);
      return res.status(500).json({ error: "Failed to connect to Telegram API", details: errorText });
    }

    const data = await response.json();

    // ✅ طباعة الاستجابة من API تليجرام لمساعدتنا في معرفة المشكلة
    console.log("🔹 استجابة API من تليجرام:", JSON.stringify(data, null, 2));

    // ✅ تحقق مما إذا كان API تليجرام أعاد خطأ
    if (!data.ok) {
      console.error(`❌ فشل في إنشاء الفاتورة: ${data.description}`);
      return res.status(500).json({ error: `Telegram API error: ${data.description}` });
    }

    const invoiceUrl = data.result;

    // ✅ تأكد من أن رابط الفاتورة صحيح
    if (!invoiceUrl || !invoiceUrl.startsWith("https://t.me/invoice/")) {
      console.error(`❌ رابط الفاتورة غير مدعوم أو غير موجود: ${invoiceUrl}`);
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
