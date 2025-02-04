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
    const invoicePayload = JSON.stringify({
      planId: plan_id,
      userId: telegram_id,
    });

    // ✅ Telegram Stars لا يحتاج إلى API خارجي لإنشاء الفاتورة
    const invoice_url = `tg://openinvoice?amount=${amount * 100}&payload=${encodeURIComponent(invoicePayload)}`;

    console.log(`✅ تم إنشاء الفاتورة بنجاح للمستخدم ${telegram_id}, رابط الدفع: ${invoice_url}`);

    return res.status(200).json({ invoice_url });
  } catch (error) {
    console.error("❌ خطأ أثناء إنشاء الفاتورة:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
