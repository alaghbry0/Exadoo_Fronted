// src/pages/api/trials/claim.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { makeSignatureHeaders } from '@/lib/signing';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!;
    const SECRET = process.env.SECRET!;
    const CLIENT_ID = process.env.CLIENT_ID || 'webapp';

    if (!BACKEND_BASE_URL || !SECRET) {
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    const { telegram_id, plan_id } = (req.body ?? {}) as {
      telegram_id?: string | number;
      plan_id?: string | number;
    };

    if (!telegram_id || !plan_id) {
      return res.status(400).json({ error: 'Missing telegram_id or plan_id' });
    }

    const sigHeaders = makeSignatureHeaders({
      clientId: CLIENT_ID,
      secret: SECRET,
      fields: [telegram_id, plan_id], // ↩️ نفس الترتيب المعتمد في الباكند لمسار التجربة
    });

    // وحّدنا المسار على /api/trials/claim
    const upstream = await fetch(`${BACKEND_BASE_URL}/api/trials/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...sigHeaders },
      body: JSON.stringify({ telegram_id, plan_id }),
    });

    const data = (await upstream.json().catch(() => ({}))) as Record<string, unknown>;
    return res.status(upstream.status).json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return res.status(500).json({ error: message });
  }
}
