/**
 * Academy Helpers
 * دوال مساعدة للأكاديمية
 */

import type { Course } from "../types/academy.types";

/**
 * تنسيق السعر - تحويل من نص إلى $XX أو "مجاني"
 */
export const formatPrice = (value?: string): string => {
  if (!value) return "";
  if (value.toLowerCase?.() === "free") return "مجاني";
  const n = Number(value);
  return isNaN(n) ? value : `$${n.toFixed(0)}`;
};

/**
 * فحص إذا كانت الدورة مجانية
 */
export const isFreeCourse = (
  c: Pick<Course, "price" | "is_free_course">,
): boolean => {
  return (c.is_free_course ?? "") === "1" || c.price?.toLowerCase?.() === "free";
};
