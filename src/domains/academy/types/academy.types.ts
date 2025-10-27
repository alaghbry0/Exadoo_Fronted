/**
 * Academy Feature Types
 * الأنواع الخاصة بالأكاديمية
 */

export interface Category {
  id: string;
  name: string;
  thumbnail?: string;
}

export interface Course {
  id: string;
  sub_category_id: string;
  title: string;
  short_description: string;
  description?: string;
  instructor_name?: string;
  instructor_photo?: string;
  discounted_price?: string;
  price: string;
  total_number_of_lessons: number;
  total_enrollment?: number;
  level?: string;
  thumbnail?: string;
  cover_image?: string;
  is_free_course?: string | null;
  outcomes?: string[];
  requirements?: string[];
  rating?: number;
  duration?: string;
}

export interface Bundle {
  id: string;
  sub_category_id: string;
  title: string;
  description?: string;
  price: string;
  image?: string;
  cover_image?: string;
}

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export type TabId = "curriculum" | "overview" | "outcomes";
