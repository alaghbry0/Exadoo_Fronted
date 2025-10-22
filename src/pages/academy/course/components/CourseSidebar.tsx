// src/features/academy/course/components/CourseSidebar.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Play } from 'lucide-react'
import SmartImage from '@/components/SmartImage'
import type { Course } from '@/types/academy'
import { formatPrice } from '@/lib/academy'

export default function CourseSidebar({
  course,
  isEnrolled,
  progress,
  onEnrollClick,
}: {
  course: Course
  isEnrolled: boolean
  progress: number
  onEnrollClick: () => void
}) {
  return (
    <aside className="sticky top-8 space-y-6 hidden lg:block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg overflow-hidden"
      >
        <div className="relative aspect-video">
          <SmartImage
            src={course.cover_image || course.thumbnail || '/image.jpg'}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
            className="object-cover"
            style={{ borderRadius: '0 0 0rem 0rem' }}
            noFade
            disableSkeleton
            eager
            priority
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <button className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center text-white hover:bg-white/30 transition-colors">
              <Play className="h-8 w-8 fill-current" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {isEnrolled ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">تقدمك</p>
                <div className="flex items-center gap-3">
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-primary-500 h-2.5 rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="font-bold text-primary-600 dark:text-primary-400">{progress}%</span>
                </div>
              </div>
              <button
                onClick={onEnrollClick}
                className="w-full text-center rounded-lg py-3 font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                استمر في التعلم
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-bold">
                  {formatPrice(course.discounted_price || course.price)}
                </span>
                {course.discounted_price && (
                  <span className="text-xl text-neutral-400 line-through">{formatPrice(course.price)}</span>
                )}
              </div>
              <button
                onClick={onEnrollClick}
                className="w-full text-center rounded-lg py-3 font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                اشترك الآن
              </button>
              <p className="text-xs text-center text-neutral-500">ضمان استرداد الأموال لمدة 30 يومًا</p>
            </div>
          )}
        </div>

        {course.outcomes?.length ? (
          <div className="border-t border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">هذه الدورة تشمل:</h3>
            <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
              {course.outcomes.slice(0, 6).map((t, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-neutral-500" />
                  <span className="line-clamp-2">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </motion.div>
    </aside>
  )
}
