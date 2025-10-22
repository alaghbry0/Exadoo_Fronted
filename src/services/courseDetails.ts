'use client'

import { useQuery, useMutation } from '@tanstack/react-query'

export interface Lesson {
  id: string
  title: string
  duration: string
  course_id: string
  section_id: string
  lesson_type: 'video' | 'quiz' | string
  start?: string
  end?: string
  lesson_status?: string
  attachment?: string | null
  attachment_url?: string | null
  attachment_type?: string | null
  summary?: string | null
  is_completed?: number
  user_validity?: boolean
}

export interface Section {
  id: string
  title: string
  course_id: string
  is_free: string
  order: string
  lessons: Lesson[]
  total_duration?: string
  lesson_counter_starts?: number
  lesson_counter_ends?: number
  completed_lesson_number?: number
  user_validity?: boolean
}

export interface CourseDetailsResponse {
  // هويّة وأساسيات
  id: string;                           // "4"
  title: string;                        // "ALL IN ONE COURSE | الدورة الشاملة"
  short_description: string;            // ""
  description: string;                  // ""
  outcomes: string[];                   // []
  language: string;                     // "english"

  // تصنيفات
  category_id: string;                  // "1"
  sub_category_id: string;              // "2"

  // ⚠️ الحقل اسمه "section" وفيه JSON string للـ IDs: "[8,9,...]"
  section: string;

  // متطلبات
  requirements: string[];               // ["..."]

  // التسعير والخصومات
  price: string;                        // "500"
  discount_flag: string | null;         // null
  discounted_price: string;             // "500"

  // المستوى والحالة
  level: string;                        // "beginner"
  user_id: string;                      // "4"
  course_type: string;                  // "general"
  is_top_course: string;                // "1"
  is_highlight_course: string;          // "1"
  is_admin: string;                     // "1"
  is_disabled: string;                  // "0"
  status: string;                       // "active"
  is_free_course: string | null;        // null
  is_limit_working: string;             // "1"
  multi_instructor: string;             // "0"
  creator: string;                      // "4"

  // وسائط وصور
  thumbnail: string;                    // "http://.../course_thumbnail_default_4.jpg"
  cover_image: string;                  // "http://.../course_cover_default_4.jpg"
  video_url: string;                    // ""

  // SEO
  course_overview_provider: string;     // ""
  meta_keywords: string;                // ""
  meta_description: string;             // ""

  // صلاحية/انتهاء
  expiry_days: string;                  // "99999"

  // تواريخ (ثواني يونكس كسلاسل)
  date_added: string;                   // "1665352800"
  last_modified: string;                // "1751490000"

  // إحصائيات
  rating: number;                       // 5
  number_of_ratings: number;            // 24
  instructor_name: string;              // "Mohamed Mahdy"
  total_enrollment: number;             // 1
  total_number_of_lessons: number;      // 152
  completion: number;                   // 2
  total_number_of_completed_lessons: number; // 3

  // السكاشن والدروس
  sections: Section[];

  // أي حقول إضافية غير متوقعة
  [key: string]: any;
}
export function useCourseDetails(telegramId?: string, courseId?: string) {
  return useQuery({
    queryKey: ['course-details', telegramId, courseId],
    enabled: !!telegramId && !!courseId,
    queryFn: async (): Promise<CourseDetailsResponse> => {
      const r = await fetch(`/api/academy/course/${encodeURIComponent(String(courseId))}?telegramId=${encodeURIComponent(String(telegramId))}`)
      if (!r.ok) throw new Error(await r.text())
      const data = await r.json()
      return data.course as CourseDetailsResponse
    },
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  })
}

export type PlaybackType = 'inline' | 'iframe'
export interface StartWatchingResult {
  status: string
  m3u8_url: string | null
  iframe_url: string | null
  headers?: Record<string,string>
  note?: string
}

export function useStartWatching() {
  return useMutation({
    mutationFn: async (payload: { telegramId: string; lessonId: string | number; playbackType: PlaybackType }): Promise<StartWatchingResult> => {
      const r = await fetch('/api/academy/lesson/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!r.ok) throw new Error(await r.text())
      return r.json()
    },
  })
}
