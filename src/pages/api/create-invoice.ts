import { NextApiRequest, NextApiResponse } from 'next';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// ملاحظة: العملة للـ Stars هي XTR فقط
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { telegram_id, amount, payment_token, title, description, payload } = req.body || {};

  if (!payment_token || !telegram_id || amount === undefined) {
    return res.status(400).json({ error: 'Missing required fields: telegram_id, amount, payment_token' });
  }

  const numericTelegramId = Number(telegram_id);
  const numericAmount = Number(amount);

  if (!TELEGRAM_BOT_TOKEN) {
    return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN not configured' });
  }
  if (Number.isNaN(numericTelegramId)) return res.status(400).json({ error: 'Invalid telegram_id' });
  if (Number.isNaN(numericAmount)) return res.status(400).json({ error: 'Invalid amount' });

  const invoicePayload = {
    ...(payload || {}),
    userId: numericTelegramId,
    paymentToken: payment_token,
  };

  const finalTitle = title || 'عملية شراء';
  const finalDescription = description || 'شراء خدمة عبر الميني-آب';

  try {
    // Telegram expects "XTR" for Stars; amount is already in stars-cents upstream.
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/createInvoiceLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: finalTitle,
        description: finalDescription,
        payload: JSON.stringify(invoicePayload),
        currency: 'XTR',
        prices: [{ label: finalTitle, amount: Math.round(numericAmount) }],
        provider_data: { payment_token }, // إضافي
      }),
    });

    const data = await response.json();
    if (!response.ok || !data?.ok || !data?.result) {
      return res.status(502).json({ error: 'Telegram createInvoiceLink failed', details: data?.description || 'unknown' });
    }
    return res.status(200).json({ invoice_url: data.result, payment_token });
  } catch (e: any) {
    return res.status(500).json({ error: 'Internal server error', details: e?.message || 'unknown' });
  }
}
