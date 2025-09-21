// src/components/miniapp/CoursesSection.tsx
'use client'

import { GraduationCap, LibraryBig, RefreshCcw, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { SectionCard } from './SectionCard'
import { coerceDescription, coerceTitle, formatDate, formatPrice } from './utils'
import type { MiniAppCourse, MiniAppEnrollment } from '@/hooks/useMiniAppServices'

interface CoursesSectionProps {
  courses?: MiniAppCourse[]
  enrollments?: MiniAppEnrollment[]
  isLoading: boolean
  error: unknown
  onRetry: () => void
}

function getPromotionLabel(course: MiniAppCourse): string | null {
  if (typeof course.promotion === 'string' && course.promotion.trim()) return course.promotion
  if (typeof course.promotion_label === 'string' && course.promotion_label.trim()) return course.promotion_label
  if (Array.isArray(course.promotions) && course.promotions.length) {
    const first = course.promotions[0]
    if (typeof first === 'string') return first
    if (first && typeof first === 'object' && 'label' in first && typeof first.label === 'string') {
      return first.label
    }
  }
  return null
}

export function CoursesSection({ courses, enrollments, isLoading, error, onRetry }: CoursesSectionProps) {
  if (isLoading) {
    return (
      <SectionCard
        title="الدورات والباقات"
        description="اكتشف محتوى الأكاديمية وتقدمك الحالي."
      >
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="rounded-xl border border-slate-200/70 p-4">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="mt-2 h-4 w-3/4" />
              <Skeleton className="mt-4 h-4 w-1/3" />
            </div>
          ))}
        </div>
      </SectionCard>
    )
  }

  if (error) {
    return (
      <SectionCard
        title="الدورات والباقات"
        description="تعذر تحميل محتوى الأكاديمية."
        action={
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCcw className="ml-2 h-4 w-4" />إعادة المحاولة
          </Button>
        }
      >
        <p className="text-sm text-slate-600">يرجى المحاولة من جديد بعد لحظات أو التواصل مع فريق الدعم.</p>
      </SectionCard>
    )
  }

  const enrolledSet = new Set(
    (enrollments ?? [])
      .map((enrollment) => String(enrollment.course_id ?? enrollment.id ?? ''))
      .filter((value) => value.length > 0),
  )

  const enrolledCourses = (enrollments ?? []).map((enrollment, index) => {
    const title = coerceTitle(enrollment, `دورتك رقم ${index + 1}`)
    const price = formatPrice(enrollment.price ?? enrollment.amount, enrollment.currency)
    const expiry = formatDate(enrollment.expiry_date ?? enrollment.end_date ?? null)
    const description =
      coerceDescription(enrollment.description ?? enrollment.summary) ?? 'استكمل تعلمك وابقَ على اطلاع بالمحتوى الجديد.'

    return (
      <div key={`${enrollment.id ?? index}-${title}`} className="rounded-xl border border-slate-200/70 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-600">{description}</p>
          </div>
          {price ? <span className="text-sm font-semibold text-primary-600">{price}</span> : null}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <LibraryBig className="h-4 w-4" />
          <span>تاريخ الانتهاء: {expiry ?? 'غير محدد'}</span>
        </div>
      </div>
    )
  })

  const availableCourses = (courses ?? []).filter((course) => {
    const courseId = String(course.course_id ?? course.id ?? '')
    if (!courseId) return true
    return !enrolledSet.has(courseId)
  })

  return (
    <SectionCard
      title="الدورات والباقات"
      description="تابع دوراتك الحالية واكتشف محتوى جديد داخل الأكاديمية."
      action={
        <Button variant="secondary" size="sm" className="font-semibold">
          تصفح الأكاديمية
        </Button>
      }
    >
      <div className="space-y-6">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <GraduationCap className="h-4 w-4 text-primary-500" />
            <span>دوراتي الحالية</span>
          </div>
          {enrolledCourses.length ? (
            <div className="space-y-3">{enrolledCourses}</div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-100/60 p-5 text-center text-sm text-slate-600">
              لا توجد دورات مشترك بها حاليًا. ابدأ رحلتك التعليمية الآن!
            </div>
          )}
        </div>

        <Separator />

        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Sparkles className="h-4 w-4 text-primary-500" />
            <span>محتوى متاح للانضمام</span>
          </div>
          {availableCourses.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {availableCourses.map((course, index) => {
                const title = coerceTitle(course, `دورة جديدة ${index + 1}`)
                const description =
                  coerceDescription(course.description ?? course.summary) ?? 'اكتشف مهارات جديدة وطور من مستواك.'
                const price = formatPrice(course.price ?? course.amount, course.currency)
                const promotion = getPromotionLabel(course)

                return (
                  <div key={`${course.id ?? course.course_id ?? index}-${title}`} className="rounded-xl border border-slate-200/70 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                        <p className="text-sm text-slate-600">{description}</p>
                      </div>
                      {price ? <span className="text-sm font-semibold text-primary-600">{price}</span> : null}
                    </div>
                    {promotion ? (
                      <Badge variant="outline" className="mt-3 inline-flex items-center gap-1 text-xs">
                        <Sparkles className="h-3 w-3 text-primary-500" />
                        {promotion}
                      </Badge>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-100/60 p-5 text-center text-sm text-slate-600">
              تم استعراض جميع الدورات المتاحة حاليًا. تابعنا لمعرفة الجديد قريبًا.
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  )
}
