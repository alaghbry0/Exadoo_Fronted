const CACHE_NAME = 'academy-images-v1'
const MAX_ITEMS = 60
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(Promise.resolve())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      )
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  const isAcademyAsset =
    url.hostname === 'exaado.plebits.com' &&
    url.pathname.includes('/uploads/') &&
    (url.pathname.includes('/course_') || url.pathname.includes('/category_') || url.pathname.includes('/course_bundles/'))

  if (!isAcademyAsset) return

  event.respondWith(staleWhileRevalidate(event, request))
})

async function staleWhileRevalidate(event, request) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(request)

  const networkFetch = fetch(request)
    .then(async (response) => {
      if (response && response.ok) {
        const timestamped = await withTimestamp(response)
        await cache.put(request, timestamped.clone())
        await enforceCacheLimit(cache)
      }
      return response
    })
    .catch(() => undefined)

  event.waitUntil(networkFetch.then(() => undefined))

  if (cachedResponse) {
    const fresh = isFresh(cachedResponse)
    if (!fresh) {
      // wait for the network response so the caller gets up-to-date data
      const networkResponse = await networkFetch
      if (networkResponse) {
        return networkResponse.clone()
      }
    } else {
      networkFetch.catch(() => undefined)
      return cachedResponse
    }
  }

  const response = await networkFetch
  if (response) {
    return response.clone()
  }

  if (cachedResponse) {
    return cachedResponse
  }

  return fetch(request)
}

async function withTimestamp(response) {
  const headers = new Headers(response.headers)
  headers.set('sw-cache-timestamp', Date.now().toString())
  const body = await response.clone().arrayBuffer()
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

function isFresh(response) {
  const timestamp = response.headers.get('sw-cache-timestamp')
  if (!timestamp) return false
  const age = Date.now() - Number(timestamp)
  return age <= MAX_AGE_MS
}

async function enforceCacheLimit(cache) {
  const requests = await cache.keys()
  if (requests.length <= MAX_ITEMS) return
  const entries = await Promise.all(
    requests.map(async (request) => {
      const response = await cache.match(request)
      const timestamp = response?.headers.get('sw-cache-timestamp')
      return {
        request,
        timestamp: timestamp ? Number(timestamp) : 0,
      }
    }),
  )

  entries
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(0, Math.max(0, entries.length - MAX_ITEMS))
    .forEach((entry) => {
      cache.delete(entry.request)
    })
}
