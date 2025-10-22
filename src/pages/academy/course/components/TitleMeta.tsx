// src/features/academy/course/components/TitleMeta.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import type { Course } from '@/types/academy'
import LevelBadge from './LevelBadge'
import { cn } from '@/lib/utils'

export default function TitleMeta({
  course,
  isEnrolled,
}: {
  course: Course
  isEnrolled: boolean
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto -mt-10 md:-mt-12 max-w-6xl px-4"
    >
      <div
        className={cn(
          'rounded-2xl md:rounded-3xl',
          'bg-white/80 dark:bg-neutral-900/80',
          'backdrop-blur-xl',
          'border border-neutral-200/70 dark:border-neutral-800/60',
          'shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)]',
          'p-4 sm:p-6 md:p-8'
        )}
      >
        <div className="flex flex-wrap items-center gap-3 mb-2">
          {isEnrolled && (
            <span className="inline-flex items-center gap-2 rounded-full bg-green-500/90 px-3 py-1 text-[11px] font-semibold text-white">
              <CheckCircle2 className="h-4 w-4" />
              أنت مسجل
            </span>
          )}
          {course.level && <LevelBadge level={course.level} />}
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
          {course.title}
        </h1>

        {course.short_description ? (
          <p className="mt-3 text-sm sm:text-base md:text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 line-clamp-3 md:line-clamp-3">
            {course.short_description}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center justify-start gap-3 text-xs sm:text-sm">
          {course.instructor_name && (
            <div className="flex items-center gap-3 flex-row-reverse">
              <span className="text-neutral-700 dark:text-neutral-300">
                بواسطة {course.instructor_name}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  )
}
