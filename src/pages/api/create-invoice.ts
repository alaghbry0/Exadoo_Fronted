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
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/createInvoiceLink`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "اشتراك VIP",
        description: "اشتراك شهري في الخدمة المميزة",
        payload: JSON.stringify({ planId: plan_id, userId: telegram_id }),
        currency: "XTR",
        prices: [{ label: "الاشتراك", amount: amount * 100 }],
      }),
    });

    const data = await response.json();

    if (!data.ok || !data.result.startsWith("https://t.me/invoice/")) {
      throw new Error(`❌ فشل في إنشاء الفاتورة: ${data.description || "رابط غير صالح"}`);
    }

    console.log(`✅ تم إنشاء الفاتورة بنجاح: ${data.result}`);
    return res.status(200).json({ invoice_url: data.result });

  } catch (error) {
    console.error("❌ خطأ أثناء إنشاء الفاتورة:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
