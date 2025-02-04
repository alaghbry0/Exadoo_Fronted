import { NextApiRequest, NextApiResponse } from "next";

// ✅ معالجة طلبات `POST` فقط
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { telegram_id, plan_id, amount } = req.body;

  if (!telegram_id || !plan_id || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 🔹 إنشاء رابط فاتورة Telegram Stars (محاكاة لعملية الدفع)
    const invoice_url = `https://pay.telegram.org/invoice/${Math.random().toString(36).substr(2, 9)}`;

    console.log(`✅ تم إنشاء الفاتورة بنجاح للمستخدم ${telegram_id}, رابط الدفع: ${invoice_url}`);

    return res.status(200).json({ invoice_url });
  } catch (error) {
    console.error("❌ خطأ أثناء إنشاء الفاتورة:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
