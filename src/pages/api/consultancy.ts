import type { NextApiRequest, NextApiResponse } from 'next'

/** ===== Types ===== **/
export interface ConsultancyDetails {
  id: string
  title: string
  subtitle: string
  instructor: string
  instructor_image?: string | null
  about_instructor: string
  description: string
  options: string[]               // from JSON string
  price: string                   // e.g. "299"
  discounted_price: string | null // or null
  session_minutes: string         // e.g. "30"
  time_availability: Array<{from: string; to: string}> // from JSON string
  excluded_days: string[]         // ["27-06-2025", ...]
  limit_per_week: string
  discount_per_count: string
  terms: string[]                 // from JSON string
  last_edited: string
}

export interface MyConsultation {
  id: string
  user_id: string
  date: string        // "23-07-2025"
  time_from: string   // "14:00"
  time_to: string     // "14:30"
  meeting_link: string
  reserved_by: string
  status: string      // e.g. "expired" | "active" ...
  date_added: string  // unix seconds (string)
}

export interface Slot {
  from: string
  to: string
  status: 'available' | 'reserved' | string
  is_mine: boolean
}

export type SessionTimings = Record<string, Slot[]> // { "01-10-2025": [ ... ] }

export interface ConsultancyData {
  details: ConsultancyDetails
  my_consultations: MyConsultation[]
  sessionTimings: SessionTimings
}

/** ===== Helpers ===== **/
const S = (v: any, fb = '') => (v ?? fb).toString()
const A = <T = any,>(v: any, fb: T[] = [] as T[]) => (Array.isArray(v) ? v : fb)
const parseJSON = <T = any,>(v: any, fb: T) => {
  if (typeof v === 'string') {
    try { return JSON.parse(v) as T } catch { return fb }
  }
  return (v ?? fb) as T
}

/** ===== Normalizer ===== **/
function normalizeConsultancyPayload(payload: any): ConsultancyData {
  const root = payload && typeof payload === 'object' ? payload : {}
  const c = root.consultancy && typeof root.consultancy === 'object' ? root.consultancy : root

  const det = c.details ?? {}
  const details: ConsultancyDetails = {
    id: S(det.id),
    title: S(det.title),
    subtitle: S(det.subtitle),
    instructor: S(det.instructor),
    instructor_image: det.instructor_image == null ? null : S(det.instructor_image),
    about_instructor: S(det.about_instructor),
    description: S(det.description),
    options: parseJSON<string[]>(det.options, []),
    price: S(det.price, '0'),
    discounted_price: det.discounted_price == null ? null : S(det.discounted_price),
    session_minutes: S(det.session_minutes, '30'),
    time_availability: parseJSON(det.time_availability, []) as Array<{from: string; to: string}>,
    excluded_days: parseJSON<string[]>(det.excluded_days, []),
    limit_per_week: S(det.limit_per_week, '0'),
    discount_per_count: S(det.discount_per_count, '0'),
    terms: parseJSON<string[]>(det.terms, []),
    last_edited: S(det.last_edited),
  }

  const my_consultations: MyConsultation[] = A(c.my_consultations).map((m: any) => ({
    id: S(m.id),
    user_id: S(m.user_id),
    date: S(m.date),
    time_from: S(m.time_from),
    time_to: S(m.time_to),
    meeting_link: S(m.meeting_link),
    reserved_by: S(m.reserved_by),
    status: S(m.status),
    date_added: S(m.date_added),
  }))

  const sessionTimings: SessionTimings = ((): SessionTimings => {
    const st = c.sessionTimings
    if (!st || typeof st !== 'object') return {}
    const out: SessionTimings = {}
    for (const k of Object.keys(st)) {
      out[k] = A(st[k]).map((x: any) => ({
        from: S(x.from),
        to: S(x.to),
        status: S(x.status) as any,
        is_mine: Boolean(x.is_mine),
      }))
    }
    return out
  })()

  return { details, my_consultations, sessionTimings }
}

/** ===== API Route ===== **/
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const telegramId = (req.query.telegramId ?? '').toString().trim()
    if (!telegramId) return res.status(400).json({ error: 'Missing telegramId' })

    const BASE = process.env.NEXT_PUBLIC_APPLICATION_URL
    const SECRET = process.env.NEXT_PUBLIC_APPLICATION_SECRET
    if (!BASE || !SECRET) {
      return res.status(500).json({ error: 'Server misconfigured', has_BASE: !!BASE, has_SECRET: !!SECRET })
    }

    const url = `${BASE}/api/getAllServicesForMiniApp/${encodeURIComponent(telegramId)}/consultancy`
    const upstream = await fetch(url, {
      headers: {
        Accept: 'application/json',
        secret: `Bearer ${SECRET}`, // مهم
      },
    })

    const text = await upstream.text()
    let raw: any = null
    try { raw = JSON.parse(text) } catch {}

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: 'Upstream failed',
        upstream_status: upstream.status,
        details_snippet: text.slice(0, 800),
      })
    }

    const data = normalizeConsultancyPayload(raw)

    if (req.query.debug === '1') {
      return res.status(200).json({
        upstream_url: url,
        upstream_status: upstream.status,
        title: data.details.title,
        price: data.details.price,
        options_count: data.details.options.length,
        my_count: data.my_consultations.length,
        dates: Object.keys(data.sessionTimings).slice(0, 3),
      })
    }

    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=600')
    return res.status(200).json({ consultancy: data })
  } catch (e: any) {
    return res.status(500).json({ error: 'Internal error', message: e?.message })
  }
}
