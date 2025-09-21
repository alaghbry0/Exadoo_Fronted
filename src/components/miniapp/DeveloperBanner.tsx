// src/components/miniapp/DeveloperBanner.tsx
'use client'

import { AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { MiniAppValidationIssueSummary } from '@/hooks/useMiniAppServices'

interface DeveloperBannerProps {
  issues: MiniAppValidationIssueSummary[]
  className?: string
}

export function DeveloperBanner({ issues, className }: DeveloperBannerProps) {
  if (process.env.NODE_ENV !== 'development') return null
  if (!issues.length) return null

  return (
    <div
      className={cn(
        'rounded-xl border border-red-400/60 bg-red-50 px-4 py-3 text-red-800 shadow-sm',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <span>Validation issues detected</span>
            <Badge variant="destructive" className="font-semibold uppercase">
              Dev only
            </Badge>
          </div>
          <ul className="space-y-1 text-sm leading-snug">
            {issues.slice(0, 3).map((issue) => (
              <li key={issue.endpoint}>
                <span className="font-semibold">{issue.endpoint}:</span>{' '}
                {issue.issues.map((detail, index) => (
                  <span key={detail.path.join('.') || index} className="inline">
                    {detail.message}
                    {index < issue.issues.length - 1 ? '; ' : ''}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
