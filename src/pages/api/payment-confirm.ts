import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { telegram_id, subscription_type_id, invoice_url } = req.body;

    if (!telegram_id || !subscription_type_id || !invoice_url) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        console.log(`🔹 تأكيد الدفع لـ ${telegram_id} - الخطة ${subscription_type_id}`);

        // 🔹 إرسال الدفع إلى `telegram_payments.py`
        const response = await fetch("http://127.0.0.1:5000/webhook", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Telegram-Bot-Api-Secret-Token": process.env.NEXT_PUBLIC_WEBHOOK_SECRET
            },
            body: JSON.stringify({
                telegram_id,
                subscription_type_id,
                payment_id: invoice_url  // نستخدم رابط الفاتورة كمعرف دفع
            }),
        });

        const data = await response.json();
        console.log("🔹 استجابة Webhook:", data);

        return res.status(response.status).json(data);
    } catch (error) {
        console.error("❌ خطأ أثناء تأكيد الدفع:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
