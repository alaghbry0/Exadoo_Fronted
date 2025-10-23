import React from 'react'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { cn } from '@/lib/utils'

interface LazyLoadProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
  threshold?: number
  rootMargin?: string
  freezeOnceVisible?: boolean
}

/**
 * مكون LazyLoad - يحمل المحتوى فقط عند ظهوره في viewport
 * 
 * @example
 * <LazyLoad fallback={<Skeleton />}>
 *   <HeavyComponent />
 * </LazyLoad>
 */
export function LazyLoad({
  children,
  fallback = null,
  className,
  threshold = 0.1,
  rootMargin = '50px',
  freezeOnceVisible = true,
}: LazyLoadProps) {
  const { ref, isVisible, hasBeenVisible } = useIntersectionObserver({
    threshold,
    rootMargin,
    freezeOnceVisible,
  })

  // إذا كان العنصر قد ظهر من قبل أو مرئي حالياً، نعرض المحتوى
  const shouldRender = freezeOnceVisible ? hasBeenVisible : isVisible

  return (
    <div ref={ref} className={cn('lazy-load-container', className)}>
      {shouldRender ? children : fallback}
    </div>
  )
}

/**
 * مكون LazyLoadList - لتحميل قوائم طويلة بشكل تدريجي
 */
interface LazyLoadListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  fallback?: React.ReactNode
  className?: string
  itemClassName?: string
}

export function LazyLoadList<T>({
  items,
  renderItem,
  fallback,
  className,
  itemClassName,
}: LazyLoadListProps<T>) {
  return (
    <div className={cn('lazy-load-list', className)}>
      {items.map((item, index) => (
        <LazyLoad
          key={index}
          fallback={fallback}
          className={itemClassName}
        >
          {renderItem(item, index)}
        </LazyLoad>
      ))}
    </div>
  )
}
