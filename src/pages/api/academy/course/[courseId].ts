import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { courseId } = req.query
    const telegramId = (req.query.telegramId ?? '').toString().trim()
    if (!telegramId) return res.status(400).json({ error: 'Missing telegramId' })
    if (!courseId) return res.status(400).json({ error: 'Missing courseId' })

    const BASE = process.env.NEXT_PUBLIC_APPLICATION_URL
    const SECRET = process.env.NEXT_PUBLIC_APPLICATION_SECRET
    if (!BASE || !SECRET) {
      return res.status(500).json({ error: 'Server misconfigured', has_BASE: !!BASE, has_SECRET: !!SECRET })
    }

    const url = `${BASE}/api/getMyEnrolledCourseDetailsAndLessonsForMiniApp/${encodeURIComponent(telegramId)}/${encodeURIComponent(String(courseId))}`

    const upstream = await fetch(url, {
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

    // نرجّع الريسبونس كما هو (هو أصلاً بصيغة مناسبة)
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=600')
    return res.status(200).json({ course: raw })
  } catch (e: any) {
    return res.status(500).json({ error: 'Internal error', message: e?.message })
  }
}
