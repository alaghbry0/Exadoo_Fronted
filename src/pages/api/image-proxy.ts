import type { NextApiRequest, NextApiResponse } from "next"

const CACHE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days
const CACHE_STALE_WHILE_REVALIDATE_SECONDS = 60 * 60 * 24 * 7 // 7 days
const FETCH_TIMEOUT_MS = 35000
const MAX_FETCH_ATTEMPTS = 2

const isAllowedProtocol = (protocol: string) => protocol === "http:" || protocol === "https:"

const FETCH_HEADERS = {
  Accept: "image/avif,image/webp,image/png,image/jpeg,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
  "User-Agent": "ExaadoImageProxy/1.0 (+https://exaado.plebits.com)",
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query

  if (!url || Array.isArray(url)) {
    res.status(400).json({ error: "Missing url query parameter" })
    return
  }

  let targetUrl: URL
  try {
    targetUrl = new URL(url)
  } catch {
    res.status(400).json({ error: "Invalid url" })
    return
  }

  if (!isAllowedProtocol(targetUrl.protocol)) {
    res.status(400).json({ error: "Only http and https protocols are allowed" })
    return
  }

  for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    try {
      const upstreamResponse = await fetch(targetUrl, {
        signal: controller.signal,
        cache: "no-store",
        headers: FETCH_HEADERS,
      })

      if (!upstreamResponse.ok) {
        console.error(
          `[image-proxy] Upstream responded with ${upstreamResponse.status} for ${targetUrl.toString()} (attempt ${attempt}/${MAX_FETCH_ATTEMPTS})`
        )
        if (attempt === MAX_FETCH_ATTEMPTS) {
          clearTimeout(timeout)
          res
            .status(upstreamResponse.status)
            .json({ error: `Upstream responded with ${upstreamResponse.status}` })
          return
        }

        clearTimeout(timeout)
        continue
      }

      const contentType = upstreamResponse.headers.get("content-type") ?? "application/octet-stream"
      const etag = upstreamResponse.headers.get("etag")
      const buffer = Buffer.from(await upstreamResponse.arrayBuffer())

      res.setHeader("Content-Type", contentType)
      res.setHeader("Content-Length", buffer.length.toString())
      res.setHeader(
        "Cache-Control",
        `public, max-age=${CACHE_MAX_AGE_SECONDS}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE_SECONDS}`
      )

      if (etag) {
        res.setHeader("ETag", etag)
      }

      res.status(200).send(buffer)
      clearTimeout(timeout)
      return
    } catch (error) {
      const isAbortError = error instanceof Error && error.name === "AbortError"
      console.error(
        `[image-proxy] Failed to fetch ${targetUrl.toString()} (attempt ${attempt}/${MAX_FETCH_ATTEMPTS})`,
        error
      )
      if (attempt === MAX_FETCH_ATTEMPTS) {
        const status = isAbortError ? 504 : 502
        res.status(status).json({ error: "Failed to fetch upstream image" })
        return
      }
    } finally {
      clearTimeout(timeout)
    }
  }
}
