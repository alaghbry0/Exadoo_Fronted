// src/shared/components/common/EnhancedCard.tsx
import { Card as ShadcnCard, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface EnhancedCardProps {
  children: ReactNode
  hover?: boolean
  gradient?: boolean
  className?: string
  onClick?: () => void
}

export function EnhancedCard({
  children,
  hover = true,
  gradient = false,
  className,
  onClick,
}: EnhancedCardProps) {
  return (
    <ShadcnCard
      className={cn(
        'transition-all duration-300',
        hover && 'hover:shadow-lg hover:-translate-y-1 cursor-pointer',
        gradient && 'bg-gradient-to-br from-white to-gray-50 dark:from-neutral-900 dark:to-neutral-800',
        className
      )}
      onClick={onClick}
    >
      {children}
    </ShadcnCard>
  )
}

// Service Card variant
interface ServiceCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  badge?: {
    text: string
    variant?: 'default' | 'success' | 'warning'
  }
}

export function ServiceCard({ title, description, icon: Icon, href, badge }: ServiceCardProps) {
  return (
    <Link href={href}>
      <EnhancedCard hover>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20">
              <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg">{title}</h3>
                {badge && (
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-semibold',
                    badge.variant === 'success' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                    badge.variant === 'warning' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                    !badge.variant && 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300'
                  )}>
                    {badge.text}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-neutral-400">
                {description}
              </p>
            </div>
          </div>
        </CardContent>
      </EnhancedCard>
    </Link>
  )
}

// Stats Card variant
interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatsCard({ title, value, icon: Icon, trend }: StatsCardProps) {
  return (
    <EnhancedCard gradient>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-neutral-400 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-neutral-100">{value}</p>
            {trend && (
              <p className={cn(
                'text-sm font-medium mt-1',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </p>
            )}
          </div>
          <div className="p-4 rounded-full bg-primary-100 dark:bg-primary-900/30">
            <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
      </CardContent>
    </EnhancedCard>
  )
}
