// src/pages/api/confirm_payment.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { makeSignatureHeaders } from '@/lib/signing';
import { resolveBackendConfig } from '@/lib/serverConfig';

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

    const { baseUrl, clientId, secret, webhookSecret } = resolveBackendConfig({ requireWebhookSecret: true });

    const sigHeaders = makeSignatureHeaders({
      clientId,
      secret,
      fields: [telegramId, planId],
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...sigHeaders,
    };

    if (telegramId) {
      headers['X-Telegram-Id'] = String(telegramId);
    }

    const upstreamBody: Record<string, unknown> = {
      planId,
      telegramId,
      telegramUsername,
      fullName,
    };

    if (webhookSecret) {
      upstreamBody.webhookSecret = webhookSecret;
    }

    const upstream = await fetch(`${baseUrl}/api/confirm_payment`, {
      method: 'POST',
      headers,
      body: JSON.stringify(upstreamBody),
    });

    const responseText = await upstream.text();
    let data: Record<string, unknown> = {};
    if (responseText) {
      try {
        data = JSON.parse(responseText) as Record<string, unknown>;
      } catch {
        data = { raw: responseText };
      }
    }

    if (!upstream.ok) {
      const errorMessage =
        typeof data['error'] === 'string' && data['error']
          ? (data['error'] as string)
          : upstream.statusText || 'Confirm payment failed';
      return res.status(upstream.status).json({ error: errorMessage });
    }

    return res.status(200).json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return res.status(500).json({ error: message });
  }
}
