// src/pages/api/academy/lesson/start.ts
import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * POST /api/academy/lesson/start
 * body: { telegramId: string; lessonId: string|number; playbackType: 'inline'|'iframe' }
 * يرجّع: { status, m3u8_url, iframe_url, headers, ... }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const { telegramId, lessonId, playbackType } = req.body || {}

    if (!telegramId) return res.status(400).json({ error: 'Missing telegramId' })
    if (!lessonId) return res.status(400).json({ error: 'Missing lessonId' })
    const type = playbackType === 'iframe' ? 'iframe' : 'inline'

    const BASE = process.env.NEXT_PUBLIC_APPLICATION_URL
    const SECRET = process.env.NEXT_PUBLIC_APPLICATION_SECRET
    if (!BASE || !SECRET) {
      return res.status(500).json({ error: 'Server misconfigured', has_BASE: !!BASE, has_SECRET: !!SECRET })
    }

    const url = `${BASE}/api/startWatchingVideoForMiniApp/${encodeURIComponent(String(telegramId))}/${encodeURIComponent(String(lessonId))}/${type}`

    const upstream = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json', secret: `Bearer ${SECRET}` },
    })

    const text = await upstream.text()
    let raw: any = null
    try { raw = JSON.parse(text) } catch {}

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: 'Upstream failed',
        upstream_status: upstream.status,
        details_snippet: text.slice(0, 500),
      })
    }

    // رجّع الرد كما هو (status / m3u8_url / iframe_url / headers ...)
    return res.status(200).json(raw)
  } catch (e: any) {
    return res.status(500).json({ error: 'Internal error', message: e?.message })
  }
}
