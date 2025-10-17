// src/pages/api/proxy/hls.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { URL } from 'url'

function b64urlDecode(input: string) {
  try {
    const b64 = input.replace(/-/g, '+').replace(/_/g, '/')
    const pad = b64.length % 4 ? '===='.slice(b64.length % 4) : ''
    return Buffer.from(b64 + pad, 'base64').toString('utf8')
  } catch {
    return ''
  }
}

function toAbs(base: string, maybeRel: string) {
  try { return new URL(maybeRel, base).toString() } catch { return maybeRel }
}

export const config = {
  api: { bodyParser: false }, // مهم للبث و Range
}

function looksLikeSegment(urlStr: string, contentType?: string | null) {
  // بناءً على الامتداد أو النوع
  const lower = urlStr.toLowerCase()
  if (/\.(ts|m4s|mp4|aac|mp3|webm)(\?|#|$)/.test(lower)) return true
  if (!contentType) return false
  return /(video|audio)\//i.test(contentType)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const u = (req.query.u as string) || ''
    if (!u) return res.status(400).json({ error: 'Missing u' })
    const targetURL = b64urlDecode(u)
    if (!/^https?:\/\//i.test(targetURL)) {
      return res.status(400).json({ error: 'Invalid target url' })
    }

    // Parse headers (optional)
    let extraHeaders: Record<string, string> = {}
    const h = (req.query.h as string) || ''
    if (h) {
      try { extraHeaders = JSON.parse(b64urlDecode(h) || '{}') } catch {}
    }

    const headers: Record<string, string> = {
      ...extraHeaders,
      'User-Agent': (req.headers['user-agent'] as string) || 'Mozilla/5.0',
      // Accept معزّز لقوائم HLS
      'Accept': 'application/vnd.apple.mpegurl,application/x-mpegURL,*/*',
    }
    if (req.headers.range) headers['Range'] = req.headers.range as string

    // Timeout / Abort
    const ac = new AbortController()
    const timeoutMs = 15000
    const t = setTimeout(() => ac.abort(), timeoutMs)

    const upstream = await fetch(targetURL, { headers, signal: ac.signal })
    clearTimeout(t)

    const ct = upstream.headers.get('content-type') || ''
    const status = upstream.status

    // Copy some headers safely
    const passthroughHeaders: Record<string, string> = {}
    for (const [k, v] of upstream.headers.entries()) {
      if (/^content-(type|length|range|encoding|disposition)|^accept-ranges|^etag|^cache-control/i.test(k)) {
        passthroughHeaders[k] = v
      }
    }

    // HLS playlist: rewrite URLs (m3u8)
    const isPlaylist = /application\/vnd\.apple\.mpegurl|audio\/mpegurl|application\/x-mpegurl|\.m3u8(\?|#|$)/i.test(ct) || targetURL.toLowerCase().endsWith('.m3u8')
    if (isPlaylist) {
      const text = await upstream.text()
      const base = new URL(targetURL).toString()
      const hParam = h ? `&h=${encodeURIComponent(h)}` : ''
      const origin = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`

      const rewritten = text.split('\n').map((line) => {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) return line
        const abs = toAbs(base, trimmed)
        const prox = `${origin}/api/proxy/hls?u=${encodeURIComponent(Buffer.from(abs).toString('base64url'))}${hParam}`
        return prox
      }).join('\n')

      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl')
      res.setHeader('Cache-Control', 'no-store') // لا نكاشي قوائم m3u8
      res.status(200).send(rewritten)
      return
    }

    // Segments / others: stream
    const isSegment = looksLikeSegment(targetURL, ct)

    // مرّر بعض الرؤوس المهمّة
    if (upstream.headers.get('accept-ranges')) {
      res.setHeader('Accept-Ranges', upstream.headers.get('accept-ranges') as string)
    }
    if (upstream.headers.get('content-range')) {
      res.setHeader('Content-Range', upstream.headers.get('content-range') as string)
    }
    if (passthroughHeaders['content-type']) {
      res.setHeader('Content-Type', passthroughHeaders['content-type'])
    }
    if (passthroughHeaders['content-length']) {
      res.setHeader('Content-Length', passthroughHeaders['content-length'])
    }

    // سياسة الكاش: segments فقط لها كاش قصير؛ غير ذلك no-store
    if (isSegment) {
      res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=60')
    } else {
      res.setHeader('Cache-Control', 'no-store')
    }

    res.status(status)

    // @ts-expect-error: Node Response has body as Readable
    const body = upstream.body
    if (!body) return res.end()

    // Pipe (Web Streams API)
    body.pipeTo(new WritableStream({
      write(chunk) { res.write(chunk) },
      close() { res.end() },
      abort() { res.end() }
    }) as any).catch(() => res.end())
  } catch (e: any) {
    const message = e?.name === 'AbortError'
      ? `Upstream timeout`
      : (e?.message || 'Proxy error')
    res.status(500).json({ error: 'Proxy error', message })
  }
}
