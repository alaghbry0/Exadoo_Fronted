// public/sw.js - Enhanced Image Caching Service Worker
const CACHE_NAME = 'exaado-images-v3'
const NEXT_IMAGE_CACHE = 'exaado-next-images-v1'
const STATIC_CACHE = 'static-cache-v2'
const STATIC_ASSETS = [
  '/logo.png',
  '/11.png',
  '/icon_user.svg',
  '/background_banner.svg',
  // Add more static assets as needed
]
const MAX_CACHE_SIZE = 200 // زيادة الحد الأقصى
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30 // 30 يوم للصور

// تثبيت SW وتخزين الملفات الثابتة
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...')
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets...')
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Failed to cache static assets:', err)
      })
    })
  )
  self.skipWaiting()
  console.log('[SW] Service Worker installed successfully!')
})

// تفعيل SW وتنظيف الكاش القديم
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...')
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      const validCaches = [CACHE_NAME, NEXT_IMAGE_CACHE, STATIC_CACHE]
      const oldCaches = keys.filter((key) => !validCaches.includes(key))
      
      if (oldCaches.length > 0) {
        console.log('[SW] Deleting old caches:', oldCaches)
      }
      
      await Promise.all(oldCaches.map((key) => caches.delete(key)))
      await self.clients.claim()
      
      console.log('[SW] Service Worker activated! Ready to intercept requests.')
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
  
  // التحقق من أن الطلب لـ Next.js Image Optimization
  const isNextImage = url.pathname === '/_next/image'
  
  // التحقق من أن الطلب لملفات static
  const isStaticAsset = url.pathname.startsWith('/logo') || 
                        url.pathname.startsWith('/11') || 
                        url.pathname.startsWith('/icon') ||
                        url.pathname.startsWith('/background')

  if (isImageProxy || isNextImage) {
    console.log('[SW] Intercepting image request:', url.pathname, isNextImage ? '(Next.js)' : '(Proxy)')
    event.respondWith(handleImageRequest(request, isNextImage ? NEXT_IMAGE_CACHE : CACHE_NAME))
  } else if (isStaticAsset) {
    console.log('[SW] Intercepting static asset:', url.pathname)
    event.respondWith(handleStaticAsset(request))
  }
})

/**
 * معالجة الملفات الثابتة (Cache-First مع مدة أطول)
 */
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE)
    const cached = await cache.match(request)
    
    if (cached) return cached
    
    const response = await fetch(request)
    if (response && response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.error('[SW] Error handling static asset:', error)
    return fetch(request)
  }
}

/**
 * معالجة طلب الصورة مع استراتيجية Cache First
 */
async function handleImageRequest(request, cacheName = CACHE_NAME) {
  const url = new URL(request.url)
  const shortUrl = url.pathname + url.search.substring(0, 50) // اختصار URL للـ log
  
  try {
    const cache = await caches.open(cacheName)
    const cached = await cache.match(request)

    // إذا وجد في الكاش وما زال حديث، أرجعه
    if (cached && isFresh(cached)) {
      console.log('[SW] ✓ Cache HIT (fresh):', shortUrl)
      return cached
    }

    // محاولة جلب من الشبكة
    try {
      console.log('[SW] → Fetching from network:', shortUrl)
      const response = await fetch(request)
      
      if (response && response.ok) {
        // حفظ في الكاش مع طابع زمني
        const clonedResponse = response.clone()
        const timestampedResponse = await addTimestamp(clonedResponse)
        
        await cache.put(request, timestampedResponse)
        console.log('[SW] ✓ Cached for future:', shortUrl)
        
        // تنظيف الكاش بشكل دوري
        if (Math.random() < 0.1) {
          enforceCacheLimit(cache)
        }
        
        return response
      }
    } catch (fetchError) {
      console.warn('[SW] ✗ Network fetch failed:', shortUrl, fetchError.message)
    }

    // إذا فشل الجلب وهناك نسخة مخزنة (حتى لو قديمة)، استخدمها
    if (cached) {
      console.log('[SW] ⚠ Cache HIT (stale, but serving):', shortUrl)
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