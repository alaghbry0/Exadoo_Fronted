// pages/api/indicators.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export interface IndicatorsSubscriptionPlan {
  id: string
  name: string
  price: string
  discounted_price: string
  duration_in_months: string // "0" = Lifetime
  date_added: string
  is_featured?: string | null
}
export type IndicatorsStatus = 'lifetime' | 'active' | 'expired' | string

export interface MyIndicatorsSubscription {
  id: string
  buy_indicators_id: string
  user_id: string
  trading_view_id: string
  enroll_by: string
  status: IndicatorsStatus
  expiration_date: string // "0" لو مدى الحياة
  date_added: string
}

export interface IndicatorsData {
  my_subscription: MyIndicatorsSubscription | null
  subscriptions: IndicatorsSubscriptionPlan[]
}

// Helpers صغيرة
const S = (v: any, fb = '') => (v ?? fb).toString()
const normalizePlan = (raw: any): IndicatorsSubscriptionPlan => ({
  id: S(raw.id),
  name: S(raw.name),
  price: S(raw.price, '0'),
  discounted_price: S(raw.discounted_price, '0'),
  duration_in_months: S(raw.duration_in_months, '0'),
  date_added: S(raw.date_added, ''),
  is_featured: raw.is_featured == null ? null : S(raw.is_featured),
})
const normalizeMySub = (raw: any): MyIndicatorsSubscription => ({
  id: S(raw.id),
  buy_indicators_id: S(raw.buy_indicators_id),
  user_id: S(raw.user_id),
  trading_view_id: S(raw.trading_view_id),
  enroll_by: S(raw.enroll_by),
  status: S(raw.status),
  expiration_date: S(raw.expiration_date, '0'),
  date_added: S(raw.date_added, ''),
})
const normalizePayload = (payload: any): IndicatorsData => {
  const root = payload && typeof payload === 'object' ? payload : {}
  const bi = root.buy_indicators && typeof root.buy_indicators === 'object' ? root.buy_indicators : root

  const my_subscription = bi.my_subscription ? normalizeMySub(bi.my_subscription) : null
  const subscriptions = Array.isArray(bi.subscriptions) ? bi.subscriptions.map(normalizePlan) : []

  return { my_subscription, subscriptions }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const telegramId = (req.query.telegramId ?? '').toString().trim()
    if (!telegramId) return res.status(400).json({ error: 'Missing telegramId' })

    const BASE = process.env.NEXT_PUBLIC_APPLICATION_URL
    const SECRET = process.env.NEXT_PUBLIC_APPLICATION_SECRET // ← سرّ خادمي فقط
    if (!BASE || !SECRET) {
      return res.status(500).json({ error: 'Server misconfigured', has_BASE: !!BASE, has_SECRET: !!SECRET })
    }

    const url = `${BASE}/api/getAllServicesForMiniApp/${encodeURIComponent(telegramId)}/buy_indicators`

    const upstream = await fetch(url, {
      headers: {
        Accept: 'application/json',
        secret: `Bearer ${SECRET}`, // لو الـ backend يريد Authorization بدّل الاسم هنا
      },
    })

    const text = await upstream.text()
    let raw: any = null
    try { raw = JSON.parse(text) } catch {}

    if (req.query.raw === '1') {
      return res.status(upstream.status).json({
        upstream_url: url,
        upstream_ok: upstream.ok,
        upstream_status: upstream.status,
        content_type: upstream.headers.get('content-type'),
        raw_text_snippet: text.slice(0, 1200),
      })
    }

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: 'Upstream failed',
        upstream_status: upstream.status,
        details_snippet: text.slice(0, 600),
      })
    }

    const indicators = normalizePayload(raw)

    if (req.query.debug === '1') {
      return res.status(200).json({
        upstream_url: url,
        upstream_status: upstream.status,
        counts: { subscriptions: indicators.subscriptions.length },
        my_status: indicators.my_subscription?.status ?? null,
        sample_plan: indicators.subscriptions[0] ?? null,
      })
    }

    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=600')
    return res.status(200).json({ indicators })
  } catch (e: any) {
    return res.status(500).json({ error: 'Internal error', message: e?.message })
  }
}
