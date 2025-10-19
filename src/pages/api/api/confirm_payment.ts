// src/pages/api/confirm_payment.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { makeSignatureHeaders } from '@/lib/signing';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { planId, telegramId, telegramUsername, fullName } = (req.body ?? {}) as {
      planId?: string | number;
      telegramId?: string | number;
      telegramUsername?: string;
      fullName?: string;
    };

    if (!planId || !telegramId) {
      return res.status(400).json({ error: 'Missing planId or telegramId' });
    }

    const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!;
    const CLIENT_ID = process.env.CLIENT_ID || 'webapp';
    const SECRET = process.env.SECRET!;

    if (!BACKEND_BASE_URL || !SECRET) {
      return res.status(500).json({ error: 'Server misconfigured' });
    }

    // نفس الترتيب المتوقع في verify_hmac_headers لمسار /api/confirm_payment
    const sigHeaders = makeSignatureHeaders({
      clientId: CLIENT_ID,
      secret: SECRET,
      fields: [telegramId, planId],
    });

    const upstream = await fetch(`${BACKEND_BASE_URL}/api/confirm_payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...sigHeaders },
      body: JSON.stringify({
        planId,
        telegramId,
        telegramUsername,
        fullName,
      }),
    });

    const data = await upstream.json().catch(() => ({} as any));

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: (data as any)?.error || 'Confirm payment failed' });
    }

    return res.status(200).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Internal error' });
  }
}
