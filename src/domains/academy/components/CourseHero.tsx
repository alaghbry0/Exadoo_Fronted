/**
 * Course Hero Section
 * قسم البطل لصفحة الدورة - مع الصورة والإحصائيات
 */

import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, Star } from "lucide-react";
import SmartImage from "@/shared/components/common/SmartImage";
import StatChip from "@/pages/academy/course/components/StatChip";
import type { Course } from "@/domains/academy/types";

interface CourseHeroProps {
  course: Course;
}

export const CourseHero: React.FC<CourseHeroProps> = ({ course }) => {
  return (
    <header className="relative w-full overflow-hidden text-white pt-20 md:pt-24 pb-16">
      {/* Background Image */}
      <div className="absolute inset-0">
        <SmartImage
          src={course.cover_image || course.thumbnail || "/image.jpg"}
          alt={course.title}
          fill
          blurType="secondary"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
          className="object-cover"
          style={{ borderRadius: "0 0 0rem 0rem" }}
          noFade
          disableSkeleton
          eager
          priority
        />
      </div>

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/academy"
          prefetch={false}
          className="inline-flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/50"
          aria-label="العودة إلى الأكاديمية"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>العودة</span>
        </Link>
      </div>

      {/* Gradients */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/35 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/25 to-transparent" />

      {/* Stats */}
      <div className="relative z-10 mx-auto mt-24 sm:mt-32 max-w-6xl px-4">
        <div className="flex flex-wrap gap-2">
          {typeof course.rating === "number" && (
            <StatChip icon={Star} label={`${course.rating}/5 تقييم`} />
          )}
          <StatChip
            icon={BookOpen}
            label={`${course.total_number_of_lessons} درس`}
          />
          {course.duration && <StatChip icon={Clock} label={course.duration} />}
        </div>
      </div>
    </header>
  );
};
