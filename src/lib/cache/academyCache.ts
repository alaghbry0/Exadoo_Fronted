'use client'

import type { AcademyData } from '@/pages/api/academy'

const ACADEMY_CACHE_PREFIX = 'academy-cache-v1:'
const IMAGE_METADATA_KEY = 'academy-image-metadata-v1'

export const ACADEMY_CACHE_TTL = 1000 * 60 * 30 // 30 minutes for metadata freshness
const IMAGE_METADATA_MAX_AGE = 1000 * 60 * 60 * 24 * 7 // 7 days
const MAX_IMAGE_METADATA = 60
const MAX_INLINE_IMAGES = 8
const MAX_INLINE_BYTES = 12 * 1024

export type CachedAcademyEntry = {
  data: AcademyData
  updatedAt: number
}

export type ImageMetadata = {
  url: string
  inlineBase64?: string
  updatedAt: number
}

async function getIdb() {
  const mod = await import('idb-keyval')
  return {
    get: mod.get,
    set: mod.set,
  }
}

function isBrowser() {
  return typeof window !== 'undefined' && 'indexedDB' in window
}

function buildCacheKey(telegramId: string) {
  return `${ACADEMY_CACHE_PREFIX}${telegramId}`
}

export async function readCachedAcademy(telegramId: string) {
  if (!isBrowser()) return null
  try {
    const { get } = await getIdb()
    const cached = (await get<CachedAcademyEntry>(buildCacheKey(telegramId))) ?? null
    return cached
  } catch (error) {
    console.warn('[academy-cache] Failed to read cached data', error)
    return null
  }
}

export async function writeCachedAcademy(telegramId: string, data: AcademyData) {
  if (!isBrowser()) return
  try {
    const { set } = await getIdb()
    const payload: CachedAcademyEntry = {
      data,
      updatedAt: Date.now(),
    }
    await Promise.all([
      set(buildCacheKey(telegramId), payload),
      persistImageMetadata(data),
    ])
  } catch (error) {
    console.warn('[academy-cache] Failed to write cached data', error)
  }
}

function collectImageUrls(data: AcademyData) {
  const urls = new Set<string>()
  const add = (value?: string | null) => {
    if (!value) return
    try {
      const url = new URL(value)
      if (url.hostname === 'exaado.plebits.com') {
        urls.add(url.toString())
      }
    } catch {
      // ignore invalid URLs
    }
  }

  data.courses.forEach((course) => {
    add(course.thumbnail)
    add(course.cover_image)
  })

  data.bundles.forEach((bundle) => {
    add(bundle.image)
    add(bundle.cover_image)
  })

  data.categories.forEach((category) => {
    add(category.thumbnail)
  })

  return Array.from(urls)
}

async function persistImageMetadata(data: AcademyData) {
  if (!isBrowser()) return
  const urls = collectImageUrls(data)
  if (!urls.length) return

  try {
    const { get, set } = await getIdb()
    const existing = (await get<Record<string, ImageMetadata>>(IMAGE_METADATA_KEY)) ?? {}
    const map = new Map<string, ImageMetadata>(Object.entries(existing))
    const now = Date.now()

    const inlineTargets = urls.slice(0, MAX_INLINE_IMAGES)
    const inlineResults = await Promise.all(
      inlineTargets.map(async (url) => {
        const previous = map.get(url)
        if (previous?.inlineBase64 && now - previous.updatedAt < IMAGE_METADATA_MAX_AGE) {
          return previous.inlineBase64
        }
        return generateInlinePreview(url)
      }),
    )
    const inlineMap = new Map<string, string | undefined>()
    inlineTargets.forEach((url, idx) => inlineMap.set(url, inlineResults[idx]))

    urls.forEach((url) => {
      const previous = map.get(url)
      const inlineBase64 = inlineMap.get(url) ?? previous?.inlineBase64
      map.set(url, {
        url,
        inlineBase64: inlineBase64 || undefined,
        updatedAt: now,
      })
    })

    const sorted = Array.from(map.values()).sort((a, b) => b.updatedAt - a.updatedAt)
    const trimmed = sorted.slice(0, MAX_IMAGE_METADATA)
    const result = Object.fromEntries(trimmed.map((meta) => [meta.url, meta]))
    await set(IMAGE_METADATA_KEY, result)
  } catch (error) {
    console.warn('[academy-cache] Failed to persist image metadata', error)
  }
}

async function generateInlinePreview(url: string) {
  try {
    const response = await fetch(url, { mode: 'cors', cache: 'force-cache' })
    if (!response.ok) return undefined
    const contentLengthHeader = response.headers.get('content-length')
    const contentLength = contentLengthHeader ? Number(contentLengthHeader) : undefined
    if (contentLength && contentLength > MAX_INLINE_BYTES) return undefined
    const blob = await response.blob()
    if (blob.size > MAX_INLINE_BYTES) return undefined
    const dataUrl = await blobToDataUrl(blob)
    return typeof dataUrl === 'string' ? dataUrl : undefined
  } catch (error) {
    console.warn('[academy-cache] Unable to inline image preview', url, error)
    return undefined
  }
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string | ArrayBuffer | null>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export async function getImageMetadata(url: string) {
  if (!isBrowser()) return null
  try {
    const { get } = await getIdb()
    const metadata = (await get<Record<string, ImageMetadata>>(IMAGE_METADATA_KEY)) ?? {}
    const entry = metadata[url]
    if (!entry) return null
    if (Date.now() - entry.updatedAt > IMAGE_METADATA_MAX_AGE) {
      return null
    }
    return entry
  } catch (error) {
    console.warn('[academy-cache] Failed to read image metadata', error)
    return null
  }
}
