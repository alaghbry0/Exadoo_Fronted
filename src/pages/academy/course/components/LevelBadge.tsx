// src/features/academy/course/components/LevelBadge.tsx
import React from 'react'
import { cn } from '@/lib/utils'
import type { Course } from '@/types/academy'

export default function LevelBadge({ level }: { level?: Course['level'] }) {
  if (!level) return null
  const cfg = {
    beginner: { label: 'مبتدئ', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30', icon: '🌱' },
    intermediate: { label: 'متوسط', cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30', icon: '⚡' },
    advanced: { label: 'متقدم', cls: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/30', icon: '🚀' },
  } as const

  const c =
    // @ts-ignore
    cfg[(level as keyof typeof cfg) ?? 'beginner'] ??
    ({ label: String(level), cls: 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-900/20 dark:text-neutral-300 dark:border-neutral-800/30', icon: '🎯' } as const)

  return (
    <span className={cn('inline-flex items-center gap-2 rounded-xl border px-2 py-1 text-sm font-semibold', c.cls)}>
      <span>{c.icon}</span>
      {c.label}
    </span>
  )
}
