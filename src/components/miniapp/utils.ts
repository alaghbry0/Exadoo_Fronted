// src/components/miniapp/utils.ts
'use client'

import { format, parseISO } from 'date-fns'

export function formatPrice(value?: unknown, currency?: string | null): string | null {
  if (value === null || typeof value === 'undefined') return null
  const numeric = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.\-]/g, ''))
  if (Number.isNaN(numeric)) {
    return typeof value === 'string' && value.trim().length ? value : null
  }
  const formatted = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: numeric % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(numeric)
  return currency ? `${formatted} ${currency}` : formatted
}

export function formatDate(value?: string | null, fallback?: string): string | null {
  if (!value) return fallback ?? null
  try {
    return format(parseISO(value), 'dd MMM yyyy')
  } catch {
    return fallback ?? value
  }
}

export function formatTimeRange(start?: string | null, end?: string | null): string | null {
  if (!start && !end) return null
  if (start && end) {
    return `${formatTime(start)} - ${formatTime(end)}`
  }
  return formatTime(start ?? end ?? '')
}

function formatTime(value: string): string {
  try {
    const date = parseISO(value)
    return format(date, 'HH:mm')
  } catch {
    return value
  }
}

export function coerceTitle(item: { title?: unknown; name?: unknown; summary?: unknown }, fallback: string): string {
  if (typeof item.title === 'string' && item.title.trim()) return item.title
  if (typeof item.name === 'string' && item.name.trim()) return item.name
  if (typeof item.summary === 'string' && item.summary.trim()) return item.summary
  return fallback
}

export function coerceDescription(value?: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value
  return null
}

function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) return []
  return Array.isArray(value) ? value : [value]
}

function extractLabelFromUnknown(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  if (typeof record.label === 'string' && record.label.trim()) return record.label.trim()
  if (typeof record.name === 'string' && record.name.trim()) return record.name.trim()
  if (typeof record.title === 'string' && record.title.trim()) return record.title.trim()
  return null
}

export function extractServiceLabels(service: {
  badge?: unknown
  badges?: unknown
  tags?: unknown
  metadata?: unknown
}): string[] {
  const labels = new Set<string>()

  const addFromCollection = (value: unknown) => {
    for (const item of toArray(value as unknown[])) {
      const label = extractLabelFromUnknown(item)
      if (label) labels.add(label)
    }
  }

  const singleBadge = extractLabelFromUnknown(service.badge)
  if (singleBadge) labels.add(singleBadge)

  addFromCollection(service.badges)
  addFromCollection(service.tags)

  if (service.metadata && typeof service.metadata === 'object') {
    const metadata = service.metadata as Record<string, unknown>
    if ('badges' in metadata) addFromCollection(metadata.badges)
    if ('tags' in metadata) addFromCollection(metadata.tags)
  }

  return Array.from(labels)
}
