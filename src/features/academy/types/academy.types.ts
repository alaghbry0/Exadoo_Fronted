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
  discounted_price?: string;
  price: string;
  total_number_of_lessons: number;
  level?: string;
  thumbnail?: string;
  is_free_course?: string | null;
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
