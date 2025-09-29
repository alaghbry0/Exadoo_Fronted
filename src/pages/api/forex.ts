import type { NextApiRequest, NextApiResponse } from 'next'

export interface MyForexSubscription {
  id: string
  trading_panel_id: string
  user_id: string
  forex_addresses: string // JSON string: ["11237841", ...]
  enroll_by: string
  status: string // e.g. "lifetime"
  expiration_date: string
  date_added: string // unix seconds
}

export interface ForexSubscriptionPlan {
  id: string
  name: string
  price: string
  discounted_price: string | null
  duration_in_months: string // "0" => lifetime
  date_added: string
}

export interface ForexData {
  my_subscription?: MyForexSubscription
  subscriptions: ForexSubscriptionPlan[]
}

/* ===== Helpers ===== */
const S = (v: any, fb = '') => (v ?? fb).toString()
const A = <T = any,>(v: any, fb: T[] = [] as T[]) => (Array.isArray(v) ? v : fb)

/* ===== Normalizer ===== */
function normalizeForexPayload(payload: any): ForexData {
  const root = payload && typeof payload === 'object' ? payload : {}
  const fx = root.utility_trading_panels && typeof root.utility_trading_panels === 'object'
    ? root.utility_trading_panels
    : root

  const my: MyForexSubscription | undefined = fx.my_subscription
    ? {
        id: S(fx.my_subscription.id),
        trading_panel_id: S(fx.my_subscription.trading_panel_id),
        user_id: S(fx.my_subscription.user_id),
        forex_addresses: S(fx.my_subscription.forex_addresses),
        enroll_by: S(fx.my_subscription.enroll_by),
        status: S(fx.my_subscription.status),
        expiration_date: S(fx.my_subscription.expiration_date),
        date_added: S(fx.my_subscription.date_added),
      }
    : undefined

  const plans: ForexSubscriptionPlan[] = A(fx.subscriptions).map((p: any) => ({
    id: S(p.id),
    name: S(p.name),
    price: S(p.price, '0'),
    discounted_price: p.discounted_price == null ? null : S(p.discounted_price),
    duration_in_months: S(p.duration_in_months, '0'),
    date_added: S(p.date_added),
  }))

  return { my_subscription: my, subscriptions: plans }
}

/* ===== API handler ===== */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const telegramId = (req.query.telegramId ?? '').toString().trim()
    if (!telegramId) return res.status(400).json({ error: 'Missing telegramId' })

    const BASE = process.env.NEXT_PUBLIC_APPLICATION_URL
    const SECRET = process.env.NEXT_PUBLIC_APPLICATION_SECRET
    if (!BASE || !SECRET) {
      return res.status(500).json({ error: 'Server misconfigured', has_BASE: !!BASE, has_SECRET: !!SECRET })
    }

    const url = `${BASE}/api/getAllServicesForMiniApp/${encodeURIComponent(telegramId)}/utility_trading_panels`

    const upstream = await fetch(url, {
      headers: {
        Accept: 'application/json',
        secret: `Bearer ${SECRET}`, // <-- مهم
      },
    })

    const text = await upstream.text()
    let raw: any = null
    try { raw = JSON.parse(text) } catch {}

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: 'Upstream failed',
        upstream_status: upstream.status,
        details_snippet: text.slice(0, 600),
      })
    }

    const data = normalizeForexPayload(raw)

    if (req.query.debug === '1') {
      return res.status(200).json({
        upstream_url: url,
        upstream_status: upstream.status,
        my_sub_present: !!data.my_subscription,
        plans_count: data.subscriptions.length,
        sample_plan: data.subscriptions[0] ?? null,
      })
    }

    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=600')
    return res.status(200).json({ forex: data })
  } catch (e: any) {
    return res.status(500).json({ error: 'Internal error', message: e?.message })
  }
}
