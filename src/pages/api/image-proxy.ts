// src/pages/api/image-proxy.ts
import type { NextApiRequest, NextApiResponse } from "next";

// تخزين الصور في الذاكرة لمدة قصيرة لتقليل الطلبات المتكررة
const memoryCache = new Map<string, { buffer: Buffer; headers: Record<string, string>; timestamp: number }>();
const MEMORY_CACHE_TTL = 5 * 60 * 1000 // 5 دقائق (بدلاً من 1)
const MAX_CACHE_SIZE = 100 // حد أقصى 50 صورة في الذاكرة

const ALLOWED_DOMAINS = ['exaado.plebits.com'];
const CACHE_MAX_AGE = 60 * 60 * 24 * 30; // 30 يوم
const FETCH_TIMEOUT = 15000; // 15 ثانية

function isAllowedDomain(hostname: string): boolean {
  return ALLOWED_DOMAINS.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
}

function cleanMemoryCache() {
  const now = Date.now();
  const entries = Array.from(memoryCache.entries());
  
  // حذف العناصر القديمة
  for (const [key, value] of entries) {
    if (now - value.timestamp > MEMORY_CACHE_TTL) {
      memoryCache.delete(key);
    }
  }
  
  // إذا تجاوز الحد، احذف الأقدم
  if (memoryCache.size > MAX_CACHE_SIZE) {
    const sorted = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toDelete = sorted.slice(0, memoryCache.size - MAX_CACHE_SIZE);
    toDelete.forEach(([key]) => memoryCache.delete(key));
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // دعم OPTIONS للـ CORS
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { url } = req.query;

  if (!url || Array.isArray(url)) {
    res.status(400).json({ error: "Invalid url parameter" });
    return;
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(url);
  } catch {
    res.status(400).json({ error: "Invalid URL format" });
    return;
  }

  // فحص النطاق المسموح
  if (!isAllowedDomain(targetUrl.hostname)) {
    res.status(403).json({ error: "Domain not allowed" });
    return;
  }

  // فحص البروتوكول
  if (targetUrl.protocol !== "https:") {
    res.status(400).json({ error: "Only HTTPS is allowed" });
    return;
  }

  // تنظيف الكاش بشكل دوري
  if (Math.random() < 0.1) {
    cleanMemoryCache();
  }

  // التحقق من الكاش في الذاكرة
  const cached = memoryCache.get(url);
  if (cached && Date.now() - cached.timestamp < MEMORY_CACHE_TTL) {
    res.setHeader("Content-Type", cached.headers.contentType);
    res.setHeader("Content-Length", cached.buffer.length);
    res.setHeader("Cache-Control", `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=604800`);
    res.setHeader("X-Cache", "HIT");
    if (cached.headers.etag) {
      res.setHeader("ETag", cached.headers.etag);
    }
    res.status(200).send(cached.buffer);
    return;
  }

  // جلب الصورة
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(targetUrl.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "ExaadoImageProxy/2.0",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      res.status(response.status).json({ 
        error: `Upstream error: ${response.status}` 
      });
      return;
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const etag = response.headers.get("etag");
    
    // التأكد من أن المحتوى صورة
    if (!contentType.startsWith("image/")) {
      res.status(400).json({ error: "Content is not an image" });
      return;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // حفظ في الكاش
    memoryCache.set(url, {
      buffer,
      headers: { contentType, etag: etag || "" },
      timestamp: Date.now(),
    });

    // إرسال الاستجابة
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Cache-Control", `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=604800`);
    res.setHeader("X-Cache", "MISS");
    
    if (etag) {
      res.setHeader("ETag", etag);
    }

    res.status(200).send(buffer);
  } catch (error) {
    clearTimeout(timeout);
    
    const isAborted = error instanceof Error && error.name === "AbortError";
    console.error(`[image-proxy] Error fetching ${url}:`, error);
    
    res.status(isAborted ? 504 : 502).json({ 
      error: isAborted ? "Request timeout" : "Failed to fetch image" 
    });
  }
}

// تكوين Next.js API
export const config = {
  api: {
    responseLimit: '8mb',
  },
};