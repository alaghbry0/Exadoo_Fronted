'use client'

import React from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronLeft, Play } from 'lucide-react'

type Props = {
  isEnrolled: boolean
  isFree: boolean
  price?: string
  discountedPrice?: string
  formatPrice: (v?: string) => string
  onClick?: () => void
}

export default function SubscribeFab({
  isEnrolled,
  isFree,
  price,
  discountedPrice,
  formatPrice,
  onClick,
}: Props) {
  const [mounted, setMounted] = React.useState(false)
  const reduceMotion = useReducedMotion()
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return null

  // نصّ الزر مُسبقًا لمنع إعادة الحساب داخل JSX
  const label = isEnrolled ? 'استمر في التعلم' : isFree ? 'سجل الآن مجانًا' : 'اشترك الآن'
  const aria = isEnrolled ? 'اذهب إلى الدورة' : isFree ? 'سجل الآن مجانًا' : 'اشترك في الدورة'

  return createPortal(
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)',
      }}
    >
      <motion.div
        initial={
          reduceMotion ? false : { y: 48, opacity: 0, scale: 0.98 }
        }
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        className="pointer-events-auto"
      >
        <Button
          onClick={onClick}
          size="lg"
          aria-label={aria}
          className={cn(
            // مقاسات ولمس قابلية النقر على الجوال
            'h-12 md:h-14 px-5 md:px-6 rounded-full min-w-[260px]',
            // خلفية بسيطة ومحايدة تناسب الثيمين
            'bg-white/95 dark:bg-neutral-900/80 backdrop-blur-xl',
            // حدود وتباين واضح
            'border border-neutral-200/70 dark:border-neutral-700/60',
            // نص واضح
            'text-neutral-900 dark:text-neutral-100 font-medium tracking-tight',
            // ظل رقيق وحديث
            'shadow-xl',
            // انتقالات معتدلة
            'transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0',
            // تركيز للوصولية
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
            // منع التفاف العناصر داخل الزر
            'whitespace-nowrap relative overflow-hidden group'
          )}
        >
          {/* لمعة خفيفة عند التحويم */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background:
                'radial-gradient(160px 160px at 50% 10%, rgba(255,255,255,0.18), transparent 60%)'
            }}
          />

          <span className="relative z-10 flex items-center gap-3 md:gap-4">
            {/* أيقونة الحالة */}
            <span
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full shrink-0',
                isEnrolled
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'bg-primary-500 text-white'
              )}
            >
              {isEnrolled ? <ChevronLeft className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </span>

            {/* النص */}
            <span className="text-sm md:text-base">{label}</span>

            {/* السعر */}
            {!isEnrolled && (
              <span className="flex items-baseline gap-1 rounded-full px-2.5 py-1 shrink-0
                               bg-neutral-100 text-neutral-900
                               dark:bg-neutral-800 dark:text-neutral-100">
                {isFree ? (
                  <span className="text-xs md:text-sm font-semibold text-primary-700 dark:text-primary-300">
                    مجاني
                  </span>
                ) : (
                  <>
                    <span className="text-xs md:text-sm font-semibold">
                      {formatPrice(discountedPrice || price)}
                    </span>
                    {discountedPrice && (
                      <span className="hidden md:inline-block text-[11px] md:text-xs text-neutral-500 dark:text-neutral-400 line-through">
                        {formatPrice(price)}
                      </span>
                    )}
                  </>
                )}
              </span>
            )}
          </span>
        </Button>
      </motion.div>
    </div>,
    document.body
  )
}
