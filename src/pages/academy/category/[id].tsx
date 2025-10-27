/**
 * Academy Category Detail Page
 * صفحة تفاصيل تصنيف الأكاديمية
 */

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTelegram } from "@/shared/context/TelegramContext";
import { useAcademyData } from "@/domains/academy/api";
import PageLayout from "@/shared/components/layout/PageLayout";
import { Breadcrumbs } from "@/shared/components/common/Breadcrumbs";
import { PageLoader } from "@/shared/components/common/LoadingStates";
import { EmptyState } from "@/shared/components/common/EmptyState";
import { BookOpen, Award, Layers, FolderOpen } from "lucide-react";
import { colors } from "@/styles/tokens";

// Feature Components
import {
  HScroll,
  SectionHeader,
  MiniCourseCard,
  MiniBundleCard,
  CategoryHeroHeader,
} from "@/domains/academy/components";

// Types & Helpers
import type { Category, Course, Bundle } from "@/domains/academy/types/academy.types";
import { isFreeCourse } from "@/domains/academy/utils/helpers";

/**
 * Main Component
 */
export default function CategoryDetail() {
  const router = useRouter();
  const id = (router.query.id as string) || "";
  const { telegramId } = useTelegram();
  const { data, isLoading, isError, error } = useAcademyData(
    telegramId || undefined,
  );

  const category: Category | undefined = useMemo(
    () => data?.categories.find((c: Category) => c.id === id),
    [data, id],
  );

  const courses: Course[] = useMemo(
    () => data?.courses.filter((c: Course) => c.sub_category_id === id) ?? [],
    [data, id],
  );
  const bundles: Bundle[] = useMemo(
    () => data?.bundles.filter((b: Bundle) => b.sub_category_id === id) ?? [],
    [data, id],
  );

  if (isLoading) return <PageLoader />;

  if (isError)
    return (
      <EmptyState
        icon={Layers}
        title="تعذّر التحميل"
        description={(error as Error)?.message}
      />
    );

  if (!category)
    return (
      <EmptyState
        icon={Layers}
        title="لم يتم العثور على التصنيف"
        description="عذرًا، التصنيف المطلوب غير متوفر"
      />
    );

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br font-arabic"
      style={{
        backgroundImage: `linear-gradient(to bottom right, ${colors.bg.secondary}, ${colors.bg.primary}, ${colors.bg.secondary})`,
        color: colors.text.primary,
      }}
    >
      <PageLayout maxWidth="2xl">
        <main className="mx-auto max-w-7xl px-4 pb-20">
          {/* Breadcrumbs */}
          <div className="pt-4 pb-2">
            <Breadcrumbs
              items={[
                { label: "الرئيسية", href: "/" },
                { label: "الأكاديمية", href: "/academy" },
                { label: category.name },
              ]}
            />
          </div>

          {/* Hero Header */}
          <CategoryHeroHeader
            category={category}
            coursesCount={courses.length}
            bundlesCount={bundles.length}
          />

          {/* Content Sections */}
          <div className="space-y-12 animate-slide-up">
            {/* Courses Section */}
            {courses.length > 0 && (
              <section aria-labelledby="cat-courses">
                <SectionHeader
                  icon={BookOpen}
                  title="الدورات التدريبية"
                  count={courses.length}
                  id="cat-courses"
                />
                <HScroll>
                  {courses.map((c, i) => (
                    <MiniCourseCard
                      key={c.id}
                      id={c.id}
                      title={c.title}
                      desc={c.short_description}
                      price={c.discounted_price || c.price}
                      lessons={c.total_number_of_lessons}
                      level={c.level}
                      img={c.thumbnail}
                      free={isFreeCourse(c)}
                      priority={i === 0}
                    />
                  ))}
                </HScroll>
              </section>
            )}

            {/* Bundles Section */}
            {bundles.length > 0 && (
              <section aria-labelledby="cat-bundles">
                <SectionHeader
                  icon={Award}
                  title="الحزم التعليمية"
                  count={bundles.length}
                  id="cat-bundles"
                />
                <HScroll>
                  {bundles.map((b, i) => (
                    <MiniBundleCard
                      key={b.id}
                      id={b.id}
                      title={b.title}
                      desc={b.description || ""}
                      price={b.price}
                      img={b.image || b.cover_image}
                      subCategoryId={b.sub_category_id}
                      priority={i === 0}
                    />
                  ))}
                </HScroll>
              </section>
            )}

            {/* Empty State */}
            {courses.length === 0 && bundles.length === 0 && (
              <div className="mx-auto max-w-lg">
                <div
                  className="rounded-3xl border border-dashed p-12 text-center shadow-sm"
                  style={{
                    borderColor: colors.border.default,
                    background: `linear-gradient(to bottom right, ${colors.bg.primary}, ${colors.bg.secondary})`,
                  }}
                >
                  <div
                    className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: colors.bg.tertiary }}
                  >
                    <FolderOpen className="h-10 w-10" style={{ color: colors.text.tertiary }} />
                  </div>
                  <h3
                    className="mb-2 text-xl font-bold"
                    style={{ color: colors.text.primary }}
                  >
                    لا يوجد محتوى بعد
                  </h3>
                  <p className="text-sm" style={{ color: colors.text.secondary }}>
                    لم يتم إضافة أي دورات أو حزم في هذا التصنيف حالياً
                  </p>
                  <Link
                    href="/academy"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-xl hover:shadow-primary-500/30"
                  >
                    <Layers className="h-4 w-4" />
                    تصفح التصنيفات الأخرى
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </PageLayout>
    </div>
  );
}
