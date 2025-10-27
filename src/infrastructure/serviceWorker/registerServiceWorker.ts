// src/utils/registerServiceWorker.ts
/**
 * Service Worker Registration with Advanced Error Handling
 * يسجل Service Worker لتحسين تخزين الصور مؤقتاً
 */

export async function registerServiceWorker(): Promise<void> {
  // التحقق من دعم Service Worker
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('[SW] Service Worker not supported in this browser')
    return
  }

  // تسجيل SW في كل الأوضاع (production & development)
  const isDev = process.env.NODE_ENV === 'development'
  
  if (isDev) {
    console.log('[SW] Development mode - Service Worker enabled for testing')
  }

  try {
    // الانتظار حتى تحميل الصفحة بالكامل
    if (document.readyState === 'loading') {
      await new Promise((resolve) => {
        window.addEventListener('load', resolve, { once: true })
      })
    }

    // تسجيل Service Worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none', // تجنب caching لملف SW نفسه
    })

    console.log('[SW] Service Worker registered successfully:', registration.scope)

    // التحقق من التحديثات
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (!newWorker) return

      console.log('[SW] New Service Worker installing...')

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('[SW] New Service Worker available. Reloading...')
          
          // إرسال رسالة للـ SW الجديد لتفعيله فوراً
          newWorker.postMessage({ type: 'SKIP_WAITING' })
          
          // إعادة تحميل الصفحة بعد ثانيتين
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        }
      })
    })

    // الاستماع للرسائل من SW
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'CACHE_UPDATED') {
        console.log('[SW] Cache updated:', event.data.url)
      }
    })

    // التحقق من التحديثات كل ساعة
    setInterval(() => {
      registration.update()
    }, 1000 * 60 * 60)

  } catch (error) {
    console.error('[SW] Service Worker registration failed:', error)
  }
}

/**
 * إلغاء تسجيل Service Worker (للتطوير)
 */
export async function unregisterServiceWorker(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration) {
      await registration.unregister()
      console.log('[SW] Service Worker unregistered successfully')
    }
  } catch (error) {
    console.error('[SW] Error unregistering Service Worker:', error)
  }
}

/**
 * تنظيف كاش معين
 */
export async function clearCache(cacheName?: string): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return
  }

  try {
    if (cacheName) {
      await caches.delete(cacheName)
      console.log(`[SW] Cache "${cacheName}" cleared`)
    } else {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map((name) => caches.delete(name)))
      console.log('[SW] All caches cleared')
    }
  } catch (error) {
    console.error('[SW] Error clearing cache:', error)
  }
}

/**
 * الحصول على حجم الكاش
 */
export async function getCacheSize(): Promise<number> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return 0
  }

  try {
    const cacheNames = await caches.keys()
    let totalSize = 0

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName)
      const requests = await cache.keys()
      
      for (const request of requests) {
        const response = await cache.match(request)
        if (response) {
          const blob = await response.blob()
          totalSize += blob.size
        }
      }
    }

    return totalSize
  } catch (error) {
    console.error('[SW] Error calculating cache size:', error)
    return 0
  }
}

/**
 * عرض معلومات الكاش (للتطوير)
 */
export async function logCacheInfo(): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return
  }

  try {
    const cacheNames = await caches.keys()
    console.log('[SW] Cache Names:', cacheNames)

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName)
      const requests = await cache.keys()
      console.log(`[SW] Cache "${cacheName}" has ${requests.length} entries`)
    }

    const totalSize = await getCacheSize()
    console.log(`[SW] Total cache size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
  } catch (error) {
    console.error('[SW] Error logging cache info:', error)
  }
}
