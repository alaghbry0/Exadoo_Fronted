/**
 * Category Hero Header
 * رأس صفحة التصنيف مع الأيقونة والعنوان والإحصائيات
 */

import React from "react";
import { BookOpen, Award, Layers } from "lucide-react";
import SmartImage from "@/shared/components/common/SmartImage";
import { colors } from "@/styles/tokens";
import type { Category } from "../types/academy.types";

interface CategoryHeroHeaderProps {
  category: Category;
  coursesCount: number;
  bundlesCount: number;
}

export const CategoryHeroHeader: React.FC<CategoryHeroHeaderProps> = ({
  category,
  coursesCount,
  bundlesCount,
}) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-10">
      {/* Background decorations */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-48 w-48 -translate-y-1/2 translate-x-1/2 rounded-full blur-3xl opacity-5 dark:opacity-10"
        style={{ backgroundColor: colors.brand.primary }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-0 bottom-0 h-36 w-36 translate-y-1/2 -translate-x-1/2 rounded-full blur-3xl opacity-5 dark:opacity-10"
        style={{ backgroundColor: "#f59e0b" }}
        aria-hidden="true"
      />

      <div className="relative">
        <div className="text-center animate-slide-up">
          {/* Category Icon/Image */}
          {category.thumbnail ? (
            <div
              className="mx-auto mb-6 h-24 w-24 overflow-hidden rounded-3xl shadow-lg"
              style={{
                borderWidth: "4px",
                borderColor: colors.bg.elevated,
              }}
            >
              <SmartImage
                src={category.thumbnail}
                alt={category.name}
                blurType="secondary"
                autoQuality
                width={96}
                height={96}
                className="object-cover"
              />
            </div>
          ) : (
            <div
              className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl shadow-lg"
              style={{
                borderWidth: "4px",
                borderColor: colors.bg.elevated,
                background: `linear-gradient(to bottom right, ${colors.brand.primary}, ${colors.brand.primaryHover})`,
              }}
            >
              <Layers className="h-12 w-12 text-white" />
            </div>
          )}

          {/* Category Title */}
          <h1
            className="mb-3 text-4xl font-bold md:text-5xl"
            style={{
              background: `linear-gradient(to left, ${colors.text.primary}, ${colors.text.secondary}, ${colors.text.primary})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            {category.name}
          </h1>

          {/* Stats */}
          <div className="mx-auto flex max-w-md items-center justify-center gap-6 text-sm">
            {coursesCount > 0 && (
              <div
                className="flex items-center gap-2"
                style={{ color: colors.text.secondary }}
              >
                <BookOpen className="h-4 w-4" />
                <span className="font-medium">{coursesCount} دورات</span>
              </div>
            )}
            {bundlesCount > 0 && (
              <div
                className="flex items-center gap-2"
                style={{ color: colors.text.secondary }}
              >
                <Award className="h-4 w-4" />
                <span className="font-medium">{bundlesCount} حزم</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
