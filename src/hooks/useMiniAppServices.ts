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
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value
  }
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
    promotion: z.union([z.string(), z.record(z.unknown())]).optional(),
    promotions: z.array(z.union([z.string(), z.record(z.unknown())])).optional(),
    tags: z.array(z.union([z.string(), z.record(z.unknown())])).optional(),
    badge: z.string().optional(),
    badges: z.array(z.string()).optional(),
    metadata: z.record(z.unknown()).optional(),
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

const aggregatorResponseSchema = z.union([
  aggregatorPayloadSchema,
  z
    .object({
      data: aggregatorPayloadSchema,
    })
    .passthrough(),
])

export type MiniAppAggregatorPayload = z.infer<typeof aggregatorPayloadSchema>
export type MiniAppConsultation = z.infer<typeof consultationSchema>
export type MiniAppCourse = z.infer<typeof academyCourseSchema>
export type MiniAppEnrollment = z.infer<typeof enrollmentSchema>
export type MiniAppTradingPanel = z.infer<typeof tradingPanelSchema>
export type MiniAppSignalPack = z.infer<typeof signalPackSchema>
export type MiniAppIndicator = z.infer<typeof indicatorSchema>

interface FetchOptions {
  endpoint: string
  path: string
  signal?: AbortSignal
}

async function miniAppFetch<T>(schema: z.ZodType<T>, { endpoint, path, signal }: FetchOptions): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_APPLICATION_URL
  const secret = process.env.NEXT_PUBLIC_APPLICATION_SECRET

  if (!baseUrl || !secret) {
    throw new MiniAppEnvError('Mini app services require NEXT_PUBLIC_APPLICATION_URL and NEXT_PUBLIC_APPLICATION_SECRET env vars')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => {
    controller.abort()
  }, 15_000)

  if (signal) {
    if (signal.aborted) {
      controller.abort()
    } else {
      signal.addEventListener(
        'abort',
        () => {
          controller.abort()
        },
        { once: true },
      )
    }
  }

  try {
    const target = new URL(path, baseUrl).toString()
    const response = await fetch(target, {
      method: 'GET',
      headers: {
        APPLICATION_URL: baseUrl,
        secret: `Bearer ${secret}`,
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new MiniAppFetchError(`Mini app services request failed for ${endpoint}`, response.status)
    }

    const json = await response.json()
    const parsed = schema.safeParse(json)

    if (!parsed.success) {
      throw new MiniAppValidationError(endpoint, parsed.error.issues)
    }

    if ('data' in parsed.data && parsed.data?.data) {
      return parsed.data.data as T
    }

    return parsed.data
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date: snapshotDate, data: trimmed }),
    })
    if (!response.ok) {
      throw new Error(`Snapshot endpoint responded with ${response.status}`)
    }
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
      promotion: item.promotion ?? item.promotion_label ?? null,
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

  const basePath = resolvedTelegramId ? `/api/getAllServicesForMiniApp/${resolvedTelegramId}/` : null

  const aggregator = useQuery({
    queryKey: ['miniapp', 'aggregator', resolvedTelegramId],
    enabled: shouldFetch && Boolean(basePath),
    staleTime: 4 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    queryFn: ({ signal }) =>
      miniAppFetch(aggregatorResponseSchema, {
        endpoint: 'aggregator',
        path: `${basePath}`,
        signal,
      }),
  }) as UseQueryResult<MiniAppAggregatorPayload>

  const consultancy = useQuery({
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
      }),
  }) as UseQueryResult<MiniAppConsultation[]>

  const enrollments = useQuery({
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
      }),
  }) as UseQueryResult<MiniAppEnrollment[]>

  const academy = useQuery({
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
      }),
  }) as UseQueryResult<MiniAppCourse[]>

  const tradingPanels = useQuery({
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
      }),
  }) as UseQueryResult<MiniAppTradingPanel[]>

  const signals = useQuery({
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
      }),
  }) as UseQueryResult<MiniAppSignalPack[]>

  const indicators = useQuery({
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
      }),
  }) as UseQueryResult<MiniAppIndicator[]>

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
    if (!aggregator.data && !consultancy.data && !academy.data && !enrollments.data && !tradingPanels.data && !signals.data && !indicators.data) {
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
  }, [shouldFetch, aggregator.data, consultancy.data, academy.data, enrollments.data, tradingPanels.data, signals.data, indicators.data])

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
