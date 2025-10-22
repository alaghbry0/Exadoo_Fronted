// src/types/academy.ts
export interface Course {
  id: string
  title: string
  short_description: string
  description?: string
  instructor_name?: string
  instructor_photo?: string
  level?: 'beginner' | 'intermediate' | 'advanced' | string
  total_number_of_lessons: number
  total_enrollment?: number
  thumbnail?: string
  cover_image?: string
  price: string
  discounted_price?: string
  is_free_course?: string | null
  outcomes?: string[]
  requirements?: string[]
  rating?: number
  duration?: string
}

export type TabId = 'curriculum' | 'overview' | 'outcomes'
