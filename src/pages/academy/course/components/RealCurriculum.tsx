import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function RealCurriculum({
  courseId,
  sections,
}: {
  courseId: string
  sections: Array<{
    id: string
    title: string
    lessons: Array<{
      id: string
      title: string
      duration?: string
      lesson_type?: string
      user_validity?: boolean
    }>
  }>
}) {
  if (!sections?.length) {
    return (
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 text-center">
        لا يوجد محتوى متاح حالياً.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sections.map((s) => (
        <div key={s.id} className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div className="px-4 py-3 font-bold bg-neutral-50 dark:bg-neutral-900">{s.title}</div>

          <div>
            {s.lessons.map((l, i) => {
              const isVideo = (l.lesson_type || '').toLowerCase() === 'video'
              const locked = l.user_validity === false

              return (
                <div key={l.id} className={cn('border-t border-neutral-200 dark:border-neutral-800')}>
                  <div className="flex items-center justify-between p-4">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{l.title}</div>
                      <div className="text-xs opacity-70">{l.duration || ''}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isVideo && !locked ? (
                        <Link
                          href={{
                            pathname: '/academy/watch',
                            query: {
                              courseId,
                              lessonId: l.id,
                              // تمرير العنوان اختياري لعرضه سريعاً في الهيدر
                              lessonTitle: l.title,
                            },
                          }}
                          prefetch
                          scroll={false}
                          className="text-xs rounded-md border px-3 py-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-semibold"
                          aria-label="مشاهدة"
                        >
                          مشاهدة
                        </Link>
                      ) : (
                        <span className="text-xs opacity-60">{locked ? 'مغلق' : 'غير فيديو'}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
