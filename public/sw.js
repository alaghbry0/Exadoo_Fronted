// public/sw.js
const CACHE_NAME = 'exaado-images-v2'
const MAX_CACHE_SIZE = 100
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7 // 7 أيام

// تثبيت SW
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

// تفعيل SW وتنظيف الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
      await self.clients.claim()
    })()
  )
})

// رسائل من العميل
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// معالجة الطلبات
self.addEventListener('fetch', (event) => {
  const { request } = event
  
  // فقط GET requests
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  
  // التحقق من أن الطلب لـ image-proxy API
  const isImageProxy = 
    url.pathname === '/api/image-proxy' &&
    url.searchParams.has('url')

  if (!isImageProxy) return

  event.respondWith(handleImageRequest(request))
})

/**
 * معالجة طلب الصورة مع استراتيجية Cache First
 */
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(CACHE_NAME)
    const cached = await cache.match(request)

    // إذا وجد في الكاش وما زال حديث، أرجعه
    if (cached && isFresh(cached)) {
      return cached
    }

    // محاولة جلب من الشبكة
    try {
      const response = await fetch(request)
      
      if (response && response.ok) {
        // حفظ في الكاش مع طابع زمني
        const clonedResponse = response.clone()
        const timestampedResponse = await addTimestamp(clonedResponse)
        
        await cache.put(request, timestampedResponse)
        
        // تنظيف الكاش بشكل دوري
        if (Math.random() < 0.1) {
          enforceCacheLimit(cache)
        }
        
        return response
      }
    } catch (fetchError) {
      console.warn('[SW] Network fetch failed:', fetchError)
    }

    // إذا فشل الجلب وهناك نسخة مخزنة (حتى لو قديمة)، استخدمها
    if (cached) {
      return cached
    }

    // إرجاع صورة بديلة
    return new Response(
      '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#f5f5f5"/></svg>',
      {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache',
        },
      }
    )
  } catch (error) {
    console.error('[SW] Error in handleImageRequest:', error)
    return new Response('Service Worker Error', { status: 500 })
  }
}

/**
 * إضافة طابع زمني للاستجابة
 */
async function addTimestamp(response) {
  const headers = new Headers(response.headers)
  headers.set('sw-cached-at', Date.now().toString())
  
  const body = await response.arrayBuffer()
  
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/**
 * التحقق من حداثة الاستجابة
 */
function isFresh(response) {
  const cachedAt = response.headers.get('sw-cached-at')
  if (!cachedAt) return false
  
  const age = Date.now() - Number(cachedAt)
  return age <= MAX_AGE_MS
}

/**
 * فرض حد أقصى لحجم الكاش
 */
async function enforceCacheLimit(cache) {
  try {
    const requests = await cache.keys()
    
    if (requests.length <= MAX_CACHE_SIZE) return

    // جمع معلومات الطوابع الزمنية
    const entries = await Promise.all(
      requests.map(async (request) => {
        const response = await cache.match(request)
        const timestamp = response?.headers.get('sw-cached-at')
        return {
          request,
          timestamp: timestamp ? Number(timestamp) : 0,
        }
      })
    )

    // ترتيب حسب القدم وحذف الزائد
    entries
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, entries.length - MAX_CACHE_SIZE)
      .forEach((entry) => cache.delete(entry.request))
      
  } catch (error) {
    console.error('[SW] Error enforcing cache limit:', error)
  }
}