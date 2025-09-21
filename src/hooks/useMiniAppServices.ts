// src/hooks/useMiniAppServices.ts
'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { z, ZodIssue } from 'zod'
import { FEATURE_FLAG_NEW_SERVICES, TEST_MODE_ENABLED } from '@/utils/getIsLinked'
import { useUserStore } from '@/stores/zustand/userStore'

export class MiniAppEnvError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MiniAppEnvError'
  }
}

export class MiniAppFetchError extends Error {
  public readonly status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'MiniAppFetchError'
    this.status = status
  }
}

export class MiniAppValidationError extends Error {
  public readonly issues: ZodIssue[]
  public readonly endpoint: string
  constructor(endpoint: string, issues: ZodIssue[]) {
    super(`MiniApp service validation failed for ${endpoint}`)
    this.name = 'MiniAppValidationError'
    this.endpoint = endpoint
    this.issues = issues
  }
}

const priceSchema = z.union([z.string(), z.number()]).transform((value) => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length ? trimmed : undefined
  }
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  return undefined
})

const consultationSlotSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    start: z.string().optional(),
    end: z.string().optional(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    date: z.string().optional(),
    label: z.string().optional(),
    available: z.boolean().optional(),
    status: z.string().optional(),
  })
  .passthrough()

// Zod v4: record يحتاج keyType + valueType
const JsonRecord = z.record(z.string(), z.unknown())

const baseServiceSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    title: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    summary: z.string().optional(),
    price: priceSchema.optional(),
    amount: priceSchema.optional(),
    currency: z.string().optional(),
    duration: z.string().optional(),
    period: z.string().optional(),
    status: z.string().optional(),
    enrollment_status: z.string().optional(),
    is_enrolled: z.boolean().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    expiry_date: z.string().optional(),
    expires_at: z.string().optional(),
    promotion: z.union([z.string(), JsonRecord]).optional(),
    promotions: z.array(z.union([z.string(), JsonRecord])).optional(),
    tags: z.array(z.union([z.string(), JsonRecord])).optional(),
    badge: z.string().optional(),
    badges: z.array(z.string()).optional(),
    metadata: JsonRecord.optional(),
  })
  .passthrough()

const consultationSchema = baseServiceSchema
  .extend({
    next_slots: z.array(consultationSlotSchema).optional(),
    slots: z.array(consultationSlotSchema).optional(),
  })
  .passthrough()

const academyCourseSchema = baseServiceSchema
  .extend({
    course_id: z.union([z.string(), z.number()]).optional(),
    bundle: z.boolean().optional(),
    is_bundle: z.boolean().optional(),
    category: z.string().optional(),
    promotion_label: z.string().optional(),
  })
  .passthrough()

const enrollmentSchema = baseServiceSchema
  .extend({
    course_id: z.union([z.string(), z.number()]).optional(),
    progress: z.union([z.string(), z.number()]).optional(),
    completed_at: z.string().optional(),
  })
  .passthrough()

const tradingPanelSchema = baseServiceSchema
  .extend({
    plan_id: z.union([z.string(), z.number()]).optional(),
    subscription: z
      .object({
        status: z.string().optional(),
        expiry_date: z.string().optional(),
        expires_at: z.string().optional(),
        started_at: z.string().optional(),
      })
      .partial()
      .optional(),
  })
  .passthrough()

const signalPackSchema = baseServiceSchema
  .extend({
    pack_id: z.union([z.string(), z.number()]).optional(),
    duration_days: z.union([z.string(), z.number()]).optional(),
    subscription: z
      .object({
        expires_at: z.string().optional(),
        expiry_date: z.string().optional(),
        started_at: z.string().optional(),
        status: z.string().optional(),
      })
      .partial()
      .optional(),
  })
  .passthrough()

const indicatorSchema = baseServiceSchema
  .extend({
    indicator_id: z.union([z.string(), z.number()]).optional(),
    duration_days: z.union([z.string(), z.number()]).optional(),
    access_expires_at: z.string().optional(),
  })
  .passthrough()

type UnknownRecord = Record<string, unknown>

const WRAPPER_COLLECTION_KEYS = [
  'nodes',
  'edges',
  'items',
  'list',
  'values',
  'results',
  'entries',
  'data',
] as const

const DEFAULT_UNWRAP_KEYS = [
  'node',
  'details',
  'plan',
  'service',
  'course',
  'bundle',
  'pack',
  'indicator',
  'consultation',
  'signal',
] as const

function isPlainObject(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function toRecord(value: unknown): UnknownRecord | undefined {
  return isPlainObject(value) ? value : undefined
}

function normalizePricing(record: UnknownRecord): UnknownRecord {
  const result: Record<string, unknown> = { ...record }
  const pricing = result.pricing
  if (isPlainObject(pricing)) {
    const pricingRecord = pricing as Record<string, unknown>
    if (result.amount == null && pricingRecord.amount != null) {
      result.amount = pricingRecord.amount
    }
    if (result.price == null && pricingRecord.price != null) {
      result.price = pricingRecord.price
    }
    if (result.currency == null && pricingRecord.currency != null) {
      result.currency = pricingRecord.currency
    }
  }
  return result
}

function mergePreferred(record: UnknownRecord, additionalKeys: string[] = []): UnknownRecord {
  const result = normalizePricing(record)
  const unwrapKeys = new Set<string>([...DEFAULT_UNWRAP_KEYS, ...additionalKeys])

  for (const key of unwrapKeys) {
    const value = result[key]
    if (isPlainObject(value)) {
      Object.assign(result, value)
    }
  }

  for (const key of WRAPPER_COLLECTION_KEYS) {
    if (key in result && (isPlainObject(result[key]) || Array.isArray(result[key]))) {
      delete result[key]
    }
  }

  return normalizePricing(result)
}

function flattenServiceCollection(value: unknown, additionalKeys: string[] = []): UnknownRecord[] {
  if (value == null) return []

  if (Array.isArray(value)) {
    return value.flatMap((entry) => flattenServiceCollection(entry, additionalKeys))
  }

  if (!isPlainObject(value)) {
    return []
  }

  const base: Record<string, unknown> = { ...value }
  const nestedResults: UnknownRecord[] = []

  for (const key of WRAPPER_COLLECTION_KEYS) {
    const nested = value[key]
    if (!nested) continue
    const flattened = flattenServiceCollection(nested, additionalKeys)
    if (!flattened.length) continue
    for (const entry of flattened) {
      nestedResults.push(mergePreferred({ ...base, ...entry }, additionalKeys))
    }
  }

  if (nestedResults.length) {
    return nestedResults
  }

  return [mergePreferred(base, additionalKeys)]
}

function extractServices<T>(value: unknown, options?: { preferKeys?: string[] }): T[] {
  const preferKeys = options?.preferKeys ?? []
  return flattenServiceCollection(value, preferKeys).map((item) => item as T)
}

const aggregatorPayloadSchema = z
  .object({
    consultancy: z.array(consultationSchema).optional(),
    my_enrollments: z.array(enrollmentSchema).optional(),
    academy: z.array(academyCourseSchema).optional(),
    utility_trading_panels: z.array(tradingPanelSchema).optional(),
    signals: z.array(signalPackSchema).optional(),
    buy_indicators: z.array(indicatorSchema).optional(),
  })
  .passthrough()

// لاحظ: سنستخدم payload مباشرة في استعلام aggregator بعد التحويل
// بدل union {payload | {data: payload} }
type MiniAppAggregatorPayload = z.infer<typeof aggregatorPayloadSchema>
type MiniAppConsultation   = z.infer<typeof consultationSchema>
type MiniAppCourse         = z.infer<typeof academyCourseSchema>
type MiniAppEnrollment     = z.infer<typeof enrollmentSchema>
type MiniAppTradingPanel   = z.infer<typeof tradingPanelSchema>
type MiniAppSignalPack     = z.infer<typeof signalPackSchema>
type MiniAppIndicator      = z.infer<typeof indicatorSchema>

interface FetchOptions {
  endpoint: string
  path: string
  signal?: AbortSignal
  transform?: (json: unknown) => unknown
}

/**
 * fetch داخلي عبر proxy:
 * - بدون متغيرات بيئة وهيدرز خاصة
 * - يسمح بتمرير transform كي نطابق شكل الـ schema قبل التحقق
 */
async function miniAppFetch<T>(
  schema: z.ZodType<T>,
  { endpoint, path, signal, transform }: FetchOptions,
): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)

  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', () => controller.abort(), { once: true })
  }

  try {
    const response = await fetch(path, { method: 'GET', signal: controller.signal })
    if (!response.ok) {
      throw new MiniAppFetchError(`Mini app services request failed for ${endpoint}`, response.status)
    }

    const json = await response.json()
    // طبّق التحويل إن وُجد
    const dataToParse = transform ? transform(json) : json

    const parsed = schema.safeParse(dataToParse)
    if (!parsed.success) {
      console.error(`[VALIDATION ERROR] Endpoint: ${endpoint}`, parsed.error.issues)
      throw new MiniAppValidationError(endpoint, parsed.error.issues)
    }

    // فحص آمن لحالة التغليف { data: ... }
    const maybeWrapped = parsed.data as unknown
    if (isPlainObject(maybeWrapped) && 'data' in maybeWrapped) {
      const inner = maybeWrapped.data
      if (typeof inner !== 'undefined') {
        return inner as T
      }
    }

    return parsed.data as T
  } finally {
    clearTimeout(timeout)
  }
}

interface UseMiniAppServicesArgs {
  telegramId?: string | null
  isLinked: boolean
  enabled?: boolean
}

export interface MiniAppValidationIssueSummary {
  endpoint: string
  issues: ZodIssue[]
}

export interface MiniAppServicesQueries {
  aggregator: UseQueryResult<MiniAppAggregatorPayload>
  consultancy: UseQueryResult<MiniAppConsultation[]>
  academy: UseQueryResult<MiniAppCourse[]>
  enrollments: UseQueryResult<MiniAppEnrollment[]>
  tradingPanels: UseQueryResult<MiniAppTradingPanel[]>
  signals: UseQueryResult<MiniAppSignalPack[]>
  indicators: UseQueryResult<MiniAppIndicator[]>
  validationIssues: MiniAppValidationIssueSummary[]
  resolvedTelegramId: string | null
  featureEnabled: boolean
  isTestMode: boolean
}

const persistedSnapshotDates = new Set<string>()

async function persistSnapshot(data: Partial<MiniAppAggregatorPayload>) {
  if (typeof window === 'undefined') return
  const snapshotDate = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  if (persistedSnapshotDates.has(snapshotDate)) return

  const trimmed = buildSnapshot(data)

  try {
    const response = await fetch('/api/miniapp-snapshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: snapshotDate, data: trimmed }),
    })
    if (!response.ok) throw new Error(`Snapshot endpoint responded with ${response.status}`)
    persistedSnapshotDates.add(snapshotDate)
  } catch (error) {
    console.warn('[miniapp] Failed to persist snapshot', error)
  }
}

function buildSnapshot(data: Partial<MiniAppAggregatorPayload>) {
  const sanitizeConsultations = (items?: MiniAppConsultation[]) =>
    items?.map((item) => ({
      id: item.id,
      title: item.title ?? item.name,
      price: item.price ?? item.amount,
      currency: item.currency,
      next_slots: (item.next_slots ?? item.slots ?? []).slice(0, 3).map((slot) => ({
        start: slot.start ?? slot.start_time ?? null,
        end: slot.end ?? slot.end_time ?? null,
        status: slot.status ?? null,
      })),
    })) ?? []

  const sanitizeCourses = (items?: MiniAppCourse[]) =>
    items?.map((item) => ({
      id: item.id ?? item.course_id,
      title: item.title ?? item.name,
      price: item.price ?? item.amount,
      duration: item.duration ?? item.period ?? null,
      promotion: (() => {
        if (typeof item.promotion === 'string' && item.promotion.trim()) return item.promotion
        if (typeof item.promotion_label === 'string' && item.promotion_label.trim()) return item.promotion_label
        if (Array.isArray(item.promotions) && item.promotions.length) {
          const first = item.promotions[0]
          if (typeof first === 'string' && first.trim()) return first
          if (isPlainObject(first) && typeof first.label === 'string' && first.label.trim()) return first.label
        }
        return null
      })(),
    })) ?? []

  const sanitizeEnrollments = (items?: MiniAppEnrollment[]) =>
    items?.map((item) => ({
      id: item.id ?? item.course_id,
      title: item.title ?? item.name,
      progress: item.progress ?? null,
      expiry_date: item.expiry_date ?? item.end_date ?? null,
    })) ?? []

  const sanitizePanels = (items?: MiniAppTradingPanel[]) =>
    items?.map((item) => ({
      id: item.id ?? item.plan_id,
      title: item.title ?? item.name,
      price: item.price ?? item.amount,
      subscription: item.subscription
        ? {
            status: item.subscription.status ?? null,
            expiry_date: item.subscription.expiry_date ?? item.subscription.expires_at ?? null,
          }
        : null,
    })) ?? []

  const sanitizeSignals = (items?: MiniAppSignalPack[]) =>
    items?.map((item) => ({
      id: item.id ?? item.pack_id,
      title: item.title ?? item.name,
      duration_days: item.duration_days ?? item.duration ?? null,
      subscription: item.subscription
        ? {
            status: item.subscription.status ?? null,
            expiry_date: item.subscription.expiry_date ?? item.subscription.expires_at ?? null,
          }
        : null,
    })) ?? []

  const sanitizeIndicators = (items?: MiniAppIndicator[]) =>
    items?.map((item) => ({
      id: item.id ?? item.indicator_id,
      title: item.title ?? item.name,
      price: item.price ?? item.amount,
      duration_days: item.duration_days ?? item.duration ?? null,
      expires_at: item.access_expires_at ?? item.expiry_date ?? null,
    })) ?? []

  return {
    consultancy: sanitizeConsultations(data.consultancy),
    academy: sanitizeCourses(data.academy),
    my_enrollments: sanitizeEnrollments(data.my_enrollments),
    utility_trading_panels: sanitizePanels(data.utility_trading_panels),
    signals: sanitizeSignals(data.signals),
    buy_indicators: sanitizeIndicators(data.buy_indicators),
  }
}

export function useMiniAppServices({ telegramId, isLinked, enabled = true }: UseMiniAppServicesArgs): MiniAppServicesQueries {
  const resolvedTelegramId = useMemo(() => {
    if (telegramId) return telegramId
    if (TEST_MODE_ENABLED) return '5113997414'
    return null
  }, [telegramId])

  const shouldFetch = FEATURE_FLAG_NEW_SERVICES && isLinked && enabled && Boolean(resolvedTelegramId)
  const basePath = resolvedTelegramId ? `/api/services/${resolvedTelegramId}/` : null

  // ✅ عرّف النوع على useQuery مباشرةً — بدون casts
  const aggregator = useQuery<MiniAppAggregatorPayload>({
    queryKey: ['miniapp', 'aggregator', resolvedTelegramId],
    enabled: shouldFetch && Boolean(basePath),
    staleTime: 4 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    queryFn: ({ signal }) =>
      miniAppFetch(aggregatorPayloadSchema, {
        endpoint: 'aggregator',
        path: `${basePath}`,
        signal,
        // شكّل Payload نهائي متوافق مع aggregatorPayloadSchema
        transform: (json) => {
          const data = toRecord(json) ?? {}
          const academyValue = data['academy']
          const academyData = toRecord(academyValue) ?? {}
          const myEnrollmentsValue = academyData['my_enrollments']
          const myEnrollmentsData = toRecord(myEnrollmentsValue) ?? {}
          const tradingPanelsValue = data['utility_trading_panels']
          const tradingPanelsData = toRecord(tradingPanelsValue)
          const signalsValue = data['signals']
          const signalsData = toRecord(signalsValue)
          const indicatorsValue = data['buy_indicators']
          const indicatorsData = toRecord(indicatorsValue)

          return {
            consultancy: extractServices(data['consultancy'], { preferKeys: ['details'] }),
            academy: [
              ...extractServices(academyData['all_courses'] ?? academyValue, { preferKeys: ['details', 'course'] }),
              ...extractServices(academyData['all_bundles'], { preferKeys: ['details', 'bundle'] }),
            ],
            my_enrollments: [
              ...extractServices(myEnrollmentsData['courses'] ?? myEnrollmentsValue, {
                preferKeys: ['details', 'course'],
              }),
              ...extractServices(myEnrollmentsData['bundles'], { preferKeys: ['details', 'bundle'] }),
            ],
            utility_trading_panels: extractServices(
              tradingPanelsData?.['subscriptions'] ?? tradingPanelsValue,
              { preferKeys: ['details', 'plan'] },
            ),
            signals: extractServices(signalsData?.['subscriptions'] ?? signalsValue, {
              preferKeys: ['details', 'service', 'signal'],
            }),
            buy_indicators: extractServices(indicatorsData?.['subscriptions'] ?? indicatorsValue, {
              preferKeys: ['details', 'indicator'],
            }),
          }
        },
      }),
  })

  const consultancy = useQuery<MiniAppConsultation[]>({
    queryKey: ['miniapp', 'consultancy', resolvedTelegramId],
    enabled: shouldFetch && Boolean(basePath),
    staleTime: 4 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    queryFn: ({ signal }) =>
      miniAppFetch(z.array(consultationSchema), {
        endpoint: 'consultancy',
        path: `${basePath}consultancy`,
        signal,
        transform: (json) => {
          const root = toRecord(json) ?? {}
          return extractServices(root['consultancy'] ?? json, { preferKeys: ['details'] })
        },
      }),
  })

  const enrollments = useQuery<MiniAppEnrollment[]>({
    queryKey: ['miniapp', 'enrollments', resolvedTelegramId],
    enabled: shouldFetch && Boolean(basePath),
    staleTime: 4 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    queryFn: ({ signal }) =>
      miniAppFetch(z.array(enrollmentSchema), {
        endpoint: 'my_enrollments',
        path: `${basePath}my_enrollments`,
        signal,
        transform: (json) => {
          const rootRecord = toRecord(json)
          if (!rootRecord) {
            return extractServices(json, { preferKeys: ['details', 'course'] })
          }
          const academy = toRecord(rootRecord['academy']) ?? {}
          const enrollmentsRoot = toRecord(academy['my_enrollments']) ?? {}
          return [
            ...extractServices(enrollmentsRoot['courses'], { preferKeys: ['details', 'course'] }),
            ...extractServices(enrollmentsRoot['bundles'], { preferKeys: ['details', 'bundle'] }),
          ]
        },
      }),
  })

  const academy = useQuery<MiniAppCourse[]>({
    queryKey: ['miniapp', 'academy', resolvedTelegramId],
    enabled: shouldFetch && Boolean(basePath),
    staleTime: 4 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    queryFn: ({ signal }) =>
      miniAppFetch(z.array(academyCourseSchema), {
        endpoint: 'academy',
        path: `${basePath}academy`,
        signal,
        transform: (json) => {
          const rootRecord = toRecord(json)
          if (!rootRecord) {
            return extractServices(json, { preferKeys: ['details', 'course'] })
          }
          const academy = toRecord(rootRecord['academy']) ?? {}
          return [
            ...extractServices(academy['all_courses'] ?? academy, { preferKeys: ['details', 'course'] }),
            ...extractServices(academy['all_bundles'], { preferKeys: ['details', 'bundle'] }),
          ]
        },
      }),
  })

  const tradingPanels = useQuery<MiniAppTradingPanel[]>({
    queryKey: ['miniapp', 'utility_trading_panels', resolvedTelegramId],
    enabled: shouldFetch && Boolean(basePath),
    staleTime: 4 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    queryFn: ({ signal }) =>
      miniAppFetch(z.array(tradingPanelSchema), {
        endpoint: 'utility_trading_panels',
        path: `${basePath}utility_trading_panels`,
        signal,
        transform: (json) => {
          const rootRecord = toRecord(json)
          if (!rootRecord) {
            return extractServices(json, { preferKeys: ['details', 'plan'] })
          }
          const panelsRoot = toRecord(rootRecord['utility_trading_panels']) ?? rootRecord
          return extractServices(panelsRoot['subscriptions'] ?? panelsRoot, {
            preferKeys: ['details', 'plan'],
          })
        },
      }),
  })

  const signals = useQuery<MiniAppSignalPack[]>({
    queryKey: ['miniapp', 'signals', resolvedTelegramId],
    enabled: shouldFetch && Boolean(basePath),
    staleTime: 4 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    queryFn: ({ signal }) =>
      miniAppFetch(z.array(signalPackSchema), {
        endpoint: 'signals',
        path: `${basePath}signals`,
        signal,
        transform: (json) => {
          const rootRecord = toRecord(json)
          if (!rootRecord) {
            return extractServices(json, { preferKeys: ['details', 'service', 'signal'] })
          }
          const signalsRoot = toRecord(rootRecord['signals']) ?? rootRecord
          return extractServices(signalsRoot['subscriptions'] ?? signalsRoot, {
            preferKeys: ['details', 'service', 'signal'],
          })
        },
      }),
  })

  const indicators = useQuery<MiniAppIndicator[]>({
    queryKey: ['miniapp', 'buy_indicators', resolvedTelegramId],
    enabled: shouldFetch && Boolean(basePath),
    staleTime: 4 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    queryFn: ({ signal }) =>
      miniAppFetch(z.array(indicatorSchema), {
        endpoint: 'buy_indicators',
        path: `${basePath}buy_indicators`,
        signal,
        transform: (json) => {
          const rootRecord = toRecord(json)
          if (!rootRecord) {
            return extractServices(json, { preferKeys: ['details', 'indicator'] })
          }
          const indicatorsRoot = toRecord(rootRecord['buy_indicators']) ?? rootRecord
          return extractServices(indicatorsRoot['subscriptions'] ?? indicatorsRoot, {
            preferKeys: ['details', 'indicator'],
          })
        },
      }),
  })

  const validationIssues = useMemo(() => {
    const issues: MiniAppValidationIssueSummary[] = []
    for (const query of [aggregator, consultancy, academy, enrollments, tradingPanels, signals, indicators]) {
      const error = query.error
      if (error instanceof MiniAppValidationError) {
        issues.push({ endpoint: error.endpoint, issues: error.issues.slice(0, 3) })
      }
    }
    return issues
  }, [aggregator, consultancy, academy, enrollments, tradingPanels, signals, indicators])

  const snapshotRef = useRef(false)

  useEffect(() => {
    if (!shouldFetch) return
    if (snapshotRef.current) return
    if (
      !aggregator.data &&
      !consultancy.data &&
      !academy.data &&
      !enrollments.data &&
      !tradingPanels.data &&
      !signals.data &&
      !indicators.data
    ) {
      return
    }
    const payload: Partial<MiniAppAggregatorPayload> = {
      consultancy: consultancy.data ?? aggregator.data?.consultancy,
      academy: academy.data ?? aggregator.data?.academy,
      my_enrollments: enrollments.data ?? aggregator.data?.my_enrollments,
      utility_trading_panels: tradingPanels.data ?? aggregator.data?.utility_trading_panels,
      signals: signals.data ?? aggregator.data?.signals,
      buy_indicators: indicators.data ?? aggregator.data?.buy_indicators,
    }
    snapshotRef.current = true
    persistSnapshot(payload)
  }, [
    shouldFetch,
    aggregator.data,
    consultancy.data,
    academy.data,
    enrollments.data,
    tradingPanels.data,
    signals.data,
    indicators.data,
  ])

  return {
    aggregator,
    consultancy,
    academy,
    enrollments,
    tradingPanels,
    signals,
    indicators,
    validationIssues,
    resolvedTelegramId,
    featureEnabled: FEATURE_FLAG_NEW_SERVICES,
    isTestMode: TEST_MODE_ENABLED,
  }
}

export function useMiniAppIsLinked(): boolean {
  return useUserStore((state) => state.isLinked)
}
