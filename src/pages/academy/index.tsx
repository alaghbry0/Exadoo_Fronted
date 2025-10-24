// src/pages/academy/index.tsx
"use client";

import { useMemo, useState, useCallback, useDeferredValue } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BackHeader from "@/components/BackHeader";
import AuthPrompt from "@/features/auth/components/AuthFab";
import { Button } from "@/components/ui/button";
import { componentVariants } from "@/components/ui/variants";
import { cn } from "@/lib/utils";
import { Search, Bookmark, Layers, Star, TrendingUp, Award, BookOpen, Sparkles } from "lucide-react";
import { useTelegram } from "@/context/TelegramContext";
import { useAcademyData } from "@/services/academy";
import { LazyLoad } from "@/components/common/LazyLoad";
import { CourseSkeleton } from "@/components/skeletons/CourseSkeleton";
import {
  MiniCourseCard,
  MiniBundleCard,
  CategoryCard,
  SectionHeader,
  HScroll,
  SkeletonCard,
  fadeInUpVariant,
  fadeInUpDelayedVariant,
  tabSwitchVariant,
} from "@/components/academy";
import { colors, spacing } from "@/styles/tokens";

/* =========================
   Types
========================= */
interface CourseItem {
  id: string;
  title: string;
  short_description: string;
  price: string;
  discounted_price?: string;
  total_number_of_lessons: number;
  thumbnail: string;
  is_free_course?: string | null;
  level?: "beginner" | "intermediate" | "advanced" | string;
}

interface BundleItem {
  id: string;
  title: string;
  description: string;
  price: string;
  image?: string;
  cover_image?: string;
}

interface CategoryItem {
  id: string;
  name: string;
  thumbnail?: string;
  number_of_courses?: number;
}

/* =========================
   Helpers
========================= */
const isFreeCourse = (c: Pick<CourseItem, "price" | "is_free_course">) =>
  c.is_free_course === "1" || c.price?.toLowerCase?.() === "free";

function normalizeArabic(input: string) {
  return (input || "")
    .toLowerCase()
    .replace(/[\u064B-\u0652]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}








/* =========================
   Page
========================= */
export default function AcademyIndex() {
  const [tab, setTab] = useState<"all" | "mine">("all");
  const [q, setQ] = useState("");
  const deferredQuery = useDeferredValue(q);
  const { telegramId } = useTelegram();
  const { data, isLoading, isError, error } = useAcademyData(
    telegramId || undefined,
  );

  const { topCourses, categories, topBundles, highlightCourses } =
    useMemo(() => {
      if (!data)
        return {
          topCourses: [],
          categories: [],
          topBundles: [],
          highlightCourses: [],
        };
      const allCourses = (data.courses || []) as CourseItem[];
      const allBundles = (data.bundles || []) as BundleItem[];

      let tc = ((data.top_course_ids || []) as string[])
        .map((id) => allCourses.find((c) => c.id === id))
        .filter(Boolean) as CourseItem[];
      if (tc.length === 0) tc = allCourses.slice(0, 5);

      let tb = ((data.top_bundle_ids || []) as string[])
        .map((id) => allBundles.find((b) => b.id === id))
        .filter(Boolean) as BundleItem[];
      if (tb.length === 0) tb = allBundles.slice(0, 5);

      const topIds = new Set(tc.map((c) => c.id));
      let hc = ((data.highlight_course_ids || []) as string[])
        .map((id) => allCourses.find((c) => c.id === id))
        .filter(Boolean) as CourseItem[];
      if (hc.length === 0)
        hc = allCourses.filter((c) => !topIds.has(c.id)).slice(0, 8);

      return {
        topCourses: tc,
        categories: (data.categories || []) as CategoryItem[],
        topBundles: tb,
        highlightCourses: hc,
      };
    }, [data]);

  const ql = useMemo(
    () => normalizeArabic(deferredQuery || ""),
    [deferredQuery],
  );
  const isSearching = ql.length > 0;

  const filteredData = useMemo(() => {
    if (!isSearching)
      return { topCourses, categories, topBundles, highlightCourses };

    const filterCourse = (c: CourseItem) =>
      normalizeArabic(`${c.title || ""} ${c.short_description || ""}`).includes(
        ql,
      );
    const filterBundle = (b: BundleItem) =>
      normalizeArabic(`${b.title || ""} ${b.description || ""}`).includes(ql);
    const filterCategory = (c: CategoryItem) =>
      normalizeArabic(c.name || "").includes(ql);

    return {
      topCourses: topCourses.filter(filterCourse),
      categories: categories.filter(filterCategory),
      topBundles: topBundles.filter(filterBundle),
      highlightCourses: highlightCourses.filter(filterCourse),
    };
  }, [isSearching, ql, topCourses, categories, topBundles, highlightCourses]);

  const mine = useMemo(() => {
    if (!data)
      return { courses: [] as CourseItem[], bundles: [] as BundleItem[] };
    const cset = new Set((data.my_enrollments?.course_ids || []) as string[]);
    const bset = new Set((data.my_enrollments?.bundle_ids || []) as string[]);
    return {
      courses: (data.courses || []).filter((c: CourseItem) => cset.has(c.id)),
      bundles: (data.bundles || []).filter((b: BundleItem) => bset.has(b.id)),
    };
  }, [data]);

  const handleTab = useCallback((key: "all" | "mine") => setTab(key), []);

  return (
    <div
      dir="rtl"
      className="min-h-screen font-arabic"
      style={{ backgroundColor: colors.bg.primary, color: colors.text.primary }}
    >
      <BackHeader title="الأكاديمية" backTo="/shop" backMode="always" />
      <main className="mx-auto max-w-7xl px-4 pb-20">
        {/* Hero */}
        <section
          className="relative overflow-hidden pt-8 pb-8 no-print"
          aria-labelledby="page-title"
        >
          <div className="relative text-center">
            <motion.div
              {...fadeInUpVariant}
              className="mb-6"
            >
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5">
                <Sparkles className="h-4 w-4" style={{ color: colors.brand.primary }} />
                <span className="text-sm font-medium" style={{ color: colors.brand.primary }}>
                  رحلتك التعليمية تبدأ هنا
                </span>
              </div>

              <h1
                id="page-title"
                className="mb-3 text-4xl font-bold"
                style={{ color: colors.text.primary }}
              >
                أكاديمية Exaado
              </h1>

              <p className="mx-auto max-w-2xl text-base text-balance" style={{ color: colors.text.secondary }}>
                طريقك المتكامل لإتقان التداول. تعلّم من الخبراء وطبّق
                باستراتيجيات عملية
              </p>
            </motion.div>

            {/* Search */}
            <motion.div
              {...fadeInUpDelayedVariant}
              className="mx-auto max-w-2xl"
              role="search"
            >
              <div className="relative rounded-[1.5rem] p-0.5" style={{ backgroundColor: colors.bg.elevated }}>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Search className="h-5 w-5" style={{ color: colors.text.tertiary }} />
                </div>
                <input
                  type="search"
                  placeholder="ابحث في الدورات والحزم والتصنيفات..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className={cn(
                    componentVariants.card.base,
                    "block w-full rounded-[1.35rem] py-3.5 pr-4 pl-12 text-base focus:outline-none focus:ring-4 focus:ring-primary-400/10",
                  )}
                  style={{ color: colors.text.primary }}
                  aria-label="بحث في محتوى الأكاديمية"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tabs */}
        <div
          className="sticky top-[56px] z-20 mx-0 sm:-mx-4 mb-8 border-y px-0 sm:px-4 backdrop-blur-xl"
          style={{ 
            borderColor: colors.border.default,
            backgroundColor: `${colors.bg.primary}cc`
          }}
        >
          <div
            role="tablist"
            aria-label="أقسام الأكاديمية"
            className="mx-auto flex max-w-7xl items-center justify-center gap-3 py-4"
          >
            <Button
              role="tab"
              aria-selected={tab === "all"}
              onClick={() => handleTab("all")}
              className="rounded-xl px-6 py-2.5 text-[15px] font-semibold"
              style={{
                backgroundColor: tab === "all" ? colors.brand.primary : colors.bg.secondary,
                color: tab === "all" ? "#FFFFFF" : colors.text.primary,
              }}
            >
              <Layers className="ml-2 h-4 w-4" />
              جميع المحتوى
            </Button>
            <Button
              role="tab"
              aria-selected={tab === "mine"}
              onClick={() => handleTab("mine")}
              className="rounded-xl px-6 py-2.5 text-[15px] font-semibold"
              style={{
                backgroundColor: tab === "mine" ? colors.brand.primary : colors.bg.secondary,
                color: tab === "mine" ? "#FFFFFF" : colors.text.primary,
              }}
            >
              <Bookmark className="ml-2 h-4 w-4" />
              دوراتي
            </Button>
          </div>
        </div>

        {/* Loading / Error */}
        <div aria-live="polite">
          {isLoading && (
            <section className="space-y-8">
              <div
                className="mb-5 h-7 w-40 rounded-xl animate-pulse"
                style={{ backgroundColor: colors.bg.secondary }}
              />
              <HScroll>
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </HScroll>
            </section>
          )}
          {isError && (
            <div
              className="rounded-3xl border p-8 text-center"
              style={{
                borderColor: colors.status.error,
                backgroundColor: `${colors.status.error}10`,
                color: colors.status.error,
              }}
            >
              حدث خطأ: {(error as Error)?.message}
            </div>
          )}
        </div>

        {/* Content */}
        {data && !isLoading && !isError && (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              {...tabSwitchVariant}
              className="space-y-12"
            >
              {tab === "mine" ? (
                <section className="space-y-10">
                  {/* Empty mine */}
                  {mine.courses.length === 0 && mine.bundles.length === 0 ? (
                    <div className="mx-auto max-w-lg no-print">
                      <div
                        className="rounded-3xl border border-dashed p-10 text-center"
                        style={{
                          borderColor: colors.border.default,
                          backgroundColor: colors.bg.elevated,
                        }}
                      >
                        <div
                          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                          style={{ backgroundColor: `${colors.brand.primary}15` }}
                        >
                          <BookOpen className="h-8 w-8" style={{ color: colors.brand.primary }} />
                        </div>
                        <p className="mb-2 text-lg font-bold" style={{ color: colors.text.primary }}>
                          لم تشترك في أي محتوى بعد
                        </p>
                        <p className="mb-6 text-sm" style={{ color: colors.text.secondary }}>
                          اكتشف الأكاديمية وابدأ رحلتك التعليمية من خلال تبويب
                          "جميع المحتوى"
                        </p>
                        <Button
                          className="rounded-xl px-6 py-2.5"
                          style={{ backgroundColor: colors.brand.primary, color: "#FFFFFF" }}
                          onClick={() => setTab("all")}
                        >
                          <Layers className="ml-2 h-4 w-4" />
                          استكشف الدورات الآن
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {mine.courses.length > 0 && (
                        <section aria-labelledby="my-courses">
                          <SectionHeader
                            icon={Bookmark}
                            title="دوراتي"
                            id="my-courses"
                          />
                          <HScroll>
                            {mine.courses.map((c, i) => (
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

                      {mine.bundles.length > 0 && (
                        <section aria-labelledby="my-bundles">
                          <SectionHeader
                            icon={Award}
                            title="حزمي المسجلة"
                            id="my-bundles"
                          />
                          <HScroll>
                            {mine.bundles.map((b, i) => (
                              <MiniBundleCard
                                key={b.id}
                                id={b.id}
                                title={b.title}
                                desc={b.description}
                                price={b.price}
                                img={b.image || b.cover_image}
                                variant="highlight"
                                priority={i === 0}
                              />
                            ))}
                          </HScroll>
                        </section>
                      )}
                    </>
                  )}
                </section>
              ) : (
                <>
                  {/* Top Courses */}
                  {filteredData.topCourses.length > 0 && (
                    <LazyLoad
                      fallback={
                        <div className="h-64">
                          <CourseSkeleton />
                        </div>
                      }
                    >
                      <section aria-labelledby="top-courses">
                        <SectionHeader
                          icon={TrendingUp}
                          title="الأكثر طلباً"
                          id="top-courses"
                        />
                        <HScroll>
                          {filteredData.topCourses.map((c, i) => (
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
                              variant="top"
                              priority={i === 0}
                            />
                          ))}
                        </HScroll>
                      </section>
                    </LazyLoad>
                  )}

                  {/* Categories */}
                  {filteredData.categories.length > 0 && (
                    <section aria-labelledby="categories">
                      <SectionHeader
                        icon={Layers}
                        title="التصنيفات"
                        id="categories"
                      />
                      <HScroll itemClassName="min-w-[180px] w-[55%] xs:w-[48%] sm:w-[38%] lg:w-[22%] xl:w-[18%]">
                        {filteredData.categories.map((cat, i) => (
                          <CategoryCard
                            key={cat.id}
                            {...cat}
                            priority={i === 0}
                          />
                        ))}
                      </HScroll>
                    </section>
                  )}

                  {/* Top Bundles */}
                  {filteredData.topBundles.length > 0 && (
                    <LazyLoad
                      fallback={
                        <div className="h-64">
                          <CourseSkeleton />
                        </div>
                      }
                    >
                      <section aria-labelledby="top-bundles">
                        <SectionHeader
                          icon={Award}
                          title="حزم مميزة"
                          id="top-bundles"
                        />
                        <HScroll>
                          {filteredData.topBundles.map((b, i) => (
                            <MiniBundleCard
                              key={b.id}
                              id={b.id}
                              title={b.title}
                              desc={b.description}
                              price={b.price}
                              img={b.image || b.cover_image}
                              variant="highlight"
                              priority={i === 0}
                            />
                          ))}
                        </HScroll>
                      </section>
                    </LazyLoad>
                  )}

                  {/* Highlight Courses */}
                  {filteredData.highlightCourses.length > 0 && (
                    <section aria-labelledby="highlight-courses">
                      <SectionHeader
                        icon={Star}
                        title="دورات مميزة"
                        id="highlight-courses"
                      />
                      <HScroll>
                        {filteredData.highlightCourses.map((c, i) => (
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
                            variant="highlight"
                            priority={i === 0}
                          />
                        ))}
                      </HScroll>
                    </section>
                  )}

                  {/* Empty search state */}
                  {isSearching &&
                    filteredData.topCourses.length === 0 &&
                    filteredData.categories.length === 0 &&
                    filteredData.topBundles.length === 0 &&
                    filteredData.highlightCourses.length === 0 && (
                      <div className="mx-auto max-w-lg">
                        <div
                          className="rounded-3xl border border-dashed p-10 text-center"
                          style={{
                            borderColor: colors.border.default,
                            backgroundColor: colors.bg.elevated,
                          }}
                        >
                          <div
                            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                            style={{ backgroundColor: colors.bg.secondary }}
                          >
                            <Search className="h-8 w-8" style={{ color: colors.text.tertiary }} />
                          </div>
                          <p className="mb-2 text-lg font-bold" style={{ color: colors.text.primary }}>
                            لا توجد نتائج
                          </p>
                          <p className="mb-4 text-sm" style={{ color: colors.text.secondary }}>
                            جرّب كلمات أبسط أو تصنيفات مختلفة
                          </p>
                          <div className="flex flex-wrap justify-center gap-2">
                            <span
                              className="rounded-full px-3 py-1.5 text-xs font-medium"
                              style={{ backgroundColor: colors.bg.secondary, color: colors.text.secondary }}
                            >
                              تحليل فني
                            </span>
                            <span
                              className="rounded-full px-3 py-1.5 text-xs font-medium"
                              style={{ backgroundColor: colors.bg.secondary, color: colors.text.secondary }}
                            >
                              مبتدئ
                            </span>
                            <span
                              className="rounded-full px-3 py-1.5 text-xs font-medium"
                              style={{ backgroundColor: colors.bg.secondary, color: colors.text.secondary }}
                            >
                              مجاني
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                </>
              )}

              <div className="pt-4">
                <AuthPrompt />
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
