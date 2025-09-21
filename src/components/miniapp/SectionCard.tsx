// src/components/miniapp/SectionCard.tsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface SectionCardProps {
  title: string
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function SectionCard({ title, description, action, children, className, contentClassName }: SectionCardProps) {
  return (
    <Card className={cn('border-none bg-white/80 shadow-sm backdrop-blur-sm', className)}>
      <CardHeader className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">{title}</CardTitle>
            {description ? (
              <CardDescription className="mt-1 text-sm text-slate-600">{description}</CardDescription>
            ) : null}
          </div>
          {action ? <div className="flex-shrink-0">{action}</div> : null}
        </div>
      </CardHeader>
      <CardContent className={cn('space-y-4', contentClassName)}>{children}</CardContent>
    </Card>
  )
}
