// src/lib/cache/academyCache.ts
"use client";

import type { AcademyData } from "@/pages/api/academy";

export const ACADEMY_CACHE_VERSION = 3;
const ACADEMY_CACHE_PREFIX = `academy-cache-v${ACADEMY_CACHE_VERSION}:`;
export const ACADEMY_CACHE_TTL = 1000 * 60 * 30; // 30 دقيقة

export type CachedAcademyEntry = {
  data: AcademyData;
  updatedAt: number;
};

type IdbModule = typeof import("idb-keyval");

let idbStore: Pick<IdbModule, "get" | "set" | "del" | "keys"> | null = null;

async function getIdb() {
  if (idbStore) return idbStore;

  const mod: IdbModule = await import("idb-keyval");
  idbStore = {
    get: mod.get,
    set: mod.set,
    del: mod.del,
    keys: mod.keys,
  };
  return idbStore;
}

function isBrowser() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function buildCacheKey(telegramId: string) {
  return `${ACADEMY_CACHE_PREFIX}${telegramId}`;
}

/**
 * قراءة البيانات المخزنة
 */
export async function readCachedAcademy(
  telegramId: string,
): Promise<CachedAcademyEntry | null> {
  if (!isBrowser()) return null;

  try {
    const { get } = await getIdb();
    const cached = await get<CachedAcademyEntry>(buildCacheKey(telegramId));

    if (!cached) return null;

    // التحقق من انتهاء الصلاحية
    if (Date.now() - cached.updatedAt > ACADEMY_CACHE_TTL) {
      return null;
    }

    return cached;
  } catch (error) {
    console.warn("[academy-cache] Read error:", error);
    return null;
  }
}

/**
 * كتابة البيانات إلى الكاش
 */
export async function writeCachedAcademy(
  telegramId: string,
  data: AcademyData,
): Promise<void> {
  if (!isBrowser()) return;

  try {
    const { set } = await getIdb();
    const payload: CachedAcademyEntry = {
      data,
      updatedAt: Date.now(),
    };

    await set(buildCacheKey(telegramId), payload);
  } catch (error) {
    console.warn("[academy-cache] Write error:", error);
  }
}

/**
 * مسح الكاش القديم
 */
export async function clearOldCache(): Promise<void> {
  if (!isBrowser()) return;

  try {
    const { keys, del } = await getIdb();
    const allKeys = await keys();
    const now = Date.now();

    for (const key of allKeys) {
      if (typeof key === "string" && key.startsWith(ACADEMY_CACHE_PREFIX)) {
        const { get } = await getIdb();
        const entry = await get<CachedAcademyEntry>(key);

        if (entry && now - entry.updatedAt > ACADEMY_CACHE_TTL * 2) {
          await del(key);
        }
      }
    }
  } catch (error) {
    console.warn("[academy-cache] Cleanup error:", error);
  }
}

// تنظيف تلقائي عند تحميل الصفحة
if (isBrowser()) {
  // تنظيف عشوائي (10% احتمال)
  if (Math.random() < 0.1) {
    clearOldCache();
  }
}
