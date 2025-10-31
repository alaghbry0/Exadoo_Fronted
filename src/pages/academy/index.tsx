// src/pages/academy/index.tsx
"use client";

import { useMemo, useState, useCallback, useDeferredValue } from "react";
import { AnimatePresence } from "framer-motion";
import AuthPrompt from "@/domains/auth/components/AuthFab";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/utils";
import { Search, Bookmark, Layers, Award, BookOpen } from "lucide-react";
import { useTelegram } from "@/shared/context/TelegramContext";
import { useAcademyData } from "@/domains/academy/api";
import {
  MiniCourseCard,
  MiniBundleCard,
  CategoryCard,
  TopCourseCarousel,
  LatestCourseCard,
} from "@/domains/academy/components";
import { HomeSearchBar, UserHeader } from "@/domains/home/components";
import {
  HorizontalScroll,
  PageLayout,
  buildCountBadge,
} from "@/shared/components/layout";
import { SectionHeading } from "@/shared/components/common";
import {
  colors,
  shadows,
  shadowClasses,
  withAlpha,
  spacing,
  radius,
  animations,
  semanticSpacing,
} from "@/styles/tokens";
import { AcademyCardSkeleton } from "@/shared/components/ui/skeleton-loaders";

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
  instructor_name?: string;
  rating?: number;
}

interface BundleItem {
  id: string;
  title: string;
  description: string;
  price: string;
  image?: string;
  cover_image?: string;
  sub_category_id?: string;
  free_sessions_count?: string;
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
   Top Mini Tabs (بديل الشريط السفلي)
========================= */
function TopMiniTabs({
  tab,
  onChange,
}: {
  tab: "all" | "mine";
  onChange: (v: "all" | "mine") => void;
}) {
  return (
    <div
      className="sticky top-0 z-30 px-12 mb-4"
      style={{
        backgroundColor: colors.bg.secondary,
        backdropFilter: "saturate(120%) blur(10px)",
        WebkitBackdropFilter: "saturate(120%) blur(10px)",
        borderBottom: `1px solid ${withAlpha(colors.border.default, 0.6)}`,
        paddingTop: `calc(${spacing[3]} + env(safe-area-inset-top, 0px))`,
        paddingBottom: spacing[3],
      }}
      aria-label="التبديل داخل الأكاديمية"
      dir="rtl"
    >
      <Tabs value={tab} onValueChange={(v) => onChange(v as "all" | "mine")}>
        <TabsList
          className={cn(
            "mx-auto flex w-full max-w-2xl items-center gap-2 rounded-2xl p-1",
            shadowClasses.none,
          )}
          style={{
            backgroundColor: withAlpha(colors.bg.elevated, 0.7),
            border: `1px solid ${withAlpha(colors.border.default, 0.7)}`,
          }}
        >
          

          <TabsTrigger
            value="mine"
            className={cn(
              "h-9 flex-1 rounded-xl px-3 text-sm font-semibold transition-all",
              "data-[state=active]:shadow",
            )}
            style={{
              color: tab === "mine" ? colors.brand.primary : colors.text.secondary,
              backgroundColor:
                tab === "mine"
                  ? withAlpha(colors.brand.primary, 0.12)
                  : "transparent",
              boxShadow: tab === "mine" ? shadows.colored.primary.sm : "none",
            }}
            aria-current={tab === "mine" ? "page" : undefined}
          >
            <span className="inline-flex items-center gap-2 ة">
              <Bookmark size={18} aria-hidden="true" />
              دوراتي
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="all"
            className={cn(
              "h-9 flex-1 rounded-xl px-3 text-sm font-semibold transition-all",
              "data-[state=active]:shadow",
            )}
            style={{
              color: tab === "all" ? colors.brand.primary : colors.text.secondary,
              backgroundColor:
                tab === "all"
                  ? withAlpha(colors.brand.primary, 0.12)
                  : "transparent",
              boxShadow: tab === "all" ? shadows.colored.primary.sm : "none",
            }}
            aria-current={tab === "all" ? "page" : undefined}
          >
            <span className="inline-flex items-center gap-2">
              <Layers size={18} aria-hidden="true" />
              الرئيسية
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
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
    <div dir="rtl" style={{ backgroundColor: colors.bg.secondary, minHeight: "80vh" }}>
      <UserHeader
        title={(name) => `مرحباً، ${name}`}
        subtitle="رحلتك التعليمية تبدأ من هنا"
      />

      {/* Search Bar */}
      <div className="mx-auto max-w-screen-xl">
        <HomeSearchBar
          value={q}
          onChange={setQ}
          placeholder="ابحث عن دورة"
          ariaLabel="بحث في محتوى الأكاديمية"
        />
      </div>

      {/* تبويبات علوية بدل الشريط السفلي */}
      <TopMiniTabs tab={tab} onChange={handleTab} />

      <PageLayout
        dir="rtl"
        maxWidth="2xl"
        showNavbar={false}
        style={{ backgroundColor: colors.bg.secondary }}
        mainProps={{ dir: "rtl" }}
        mainStyle={{
          backgroundColor: colors.bg.secondary,
          paddingTop: semanticSpacing.section.none,
          paddingBottom: semanticSpacing.section.md,
        }}
      >
        {/* Loading / Error */}
        <div aria-live="polite">
          {isLoading && (
            <section
              style={{
                display: "grid",
                gap: spacing[8],
              }}
            >
              <div
                className={animations.presets.pulse}
                style={{
                  height: "1.75rem",
                  width: "10rem",
                  borderRadius: radius.xl,
                  backgroundColor: colors.bg.secondary,
                  marginBottom: spacing[7],
                }}
              />
              <HorizontalScroll ariaLabel="قائمة دورات قيد التحميل" bottomPadding="md">
                {Array.from({ length: 4 }).map((_, i) => (
                  <AcademyCardSkeleton key={i} />
                ))}
              </HorizontalScroll>
            </section>
          )}
          {isError && (
            <div
              className="rounded-3xl border p-8 text-center"
              style={{
                borderColor: colors.status.error,
                backgroundColor: withAlpha(colors.status.error, 0.1),
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
            <div key={tab} className="space-y-12">
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
                          style={{ backgroundColor: withAlpha(colors.brand.primary, 0.12) }}
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
                          style={{
                            backgroundColor: colors.brand.primary,
                            color: colors.text.inverse,
                          }}
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
                          <SectionHeading
                            id="my-courses"
                            icon={Bookmark}
                            title="دوراتي"
                            action={buildCountBadge(mine.courses.length)}
                          />
                          <HorizontalScroll
                            ariaLabel="قائمة الدورات المسجلة"
                            bottomPadding="lg"
                          >
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
                          </HorizontalScroll>
                        </section>
                      )}

                      {mine.bundles.length > 0 && (
                        <section aria-labelledby="my-bundles">
                          <SectionHeading
                            id="my-bundles"
                            icon={Award}
                            title="حزمي المسجلة"
                            action={buildCountBadge(mine.bundles.length)}
                          />
                          <HorizontalScroll
                            ariaLabel="قائمة الحزم المسجلة"
                            bottomPadding="lg"
                            itemClassName="w-[280px]"
                          >
                            {mine.bundles.map((b, i) => (
                              <MiniBundleCard
                                key={b.id}
                                id={b.id}
                                title={b.title}
                                desc={b.description}
                                price={b.price}
                                img={b.image || b.cover_image}
                                subCategoryId={b.sub_category_id}
                                freeSessionsCount={b.free_sessions_count}
                                priority={i === 0}
                              />
                            ))}
                          </HorizontalScroll>
                        </section>
                      )}
                    </>
                  )}
                </section>
              ) : (
                <>
                  {/* Top Courses Carousel with Auto-Scroll */}
                  {filteredData.topCourses.length > 0 && (
                    <section aria-labelledby="top-courses-carousel" className="mb-8">
                      <div style={{ marginBottom: spacing[4] }}>
                        <SectionHeading id="top-courses-carousel" title="أفضل الدورات" />
                      </div>

                      <TopCourseCarousel
                        courses={filteredData.topCourses.slice(0, 5).map((c) => ({
                          id: c.id,
                          title: c.title,
                          subtitle: c.short_description?.substring(0, 50) || "دورة تعليمية",
                          description: c.short_description || "",
                          thumbnail: c.thumbnail || "/11.png",
                        }))}
                        autoScroll={true}
                        interval={7000}
                      />
                    </section>
                  )}

                  {/* Course Categories */}
                  {filteredData.categories.length > 0 && (
                    <section aria-labelledby="categories" className="mb-8">
                      <div style={{ marginBottom: spacing[6] }}>
                        <SectionHeading id="categories" title="تصنيفات الدورات" />
                      </div>

                      <HorizontalScroll
                        ariaLabel="قائمة تصنيفات الدورات"
                        gap="sm"
                        bottomPadding="lg"
                        itemClassName="w-auto"
                      >
                        {filteredData.categories.slice(0, 6).map((cat, i) => (
                          <CategoryCard key={cat.id} {...cat} priority={i === 0} />
                        ))}
                      </HorizontalScroll>
                    </section>
                  )}

                  {/* Latest Bundles */}
                  {filteredData.topBundles.length > 0 && (
                    <section aria-labelledby="latest-bundles" className="mb-8">
                      <div style={{ marginBottom: spacing[7] }}>
                        <SectionHeading id="latest-bundles" title="أحدث الباقات 🔥" />
                      </div>

                      <HorizontalScroll
                        ariaLabel="قائمة أحدث الباقات"
                        gap="md"
                        bottomPadding="lg"
                        itemClassName="w-[280px]"
                      >
                        {filteredData.topBundles.map((b, i) => (
                          <MiniBundleCard
                            key={b.id}
                            id={b.id}
                            title={b.title}
                            desc={b.description}
                            price={b.price}
                            img={b.image || b.cover_image}
                            subCategoryId={b.sub_category_id}
                            freeSessionsCount={b.free_sessions_count}
                            priority={i === 0}
                          />
                        ))}
                      </HorizontalScroll>
                    </section>
                  )}

                  {/* Latest Courses */}
                  {filteredData.highlightCourses.length > 0 && (
                    <section aria-labelledby="latest-courses" className="mb-8">
                      <div style={{ marginBottom: spacing[6] }}>
                        <SectionHeading id="latest-courses" title="أحدث الدورات" />
                      </div>

                      <HorizontalScroll
                        ariaLabel="قائمة أحدث الدورات"
                        gap="sm"
                        bottomPadding="lg"
                        itemClassName="w-auto"
                      >
                        {filteredData.highlightCourses.slice(0, 6).map((c, i) => (
                          <LatestCourseCard
                            key={c.id}
                            id={c.id}
                            title={c.title}
                            lessonsCount={c.total_number_of_lessons}
                            imageUrl={c.thumbnail}
                            price={c.discounted_price || c.price}
                            instructorName={c.instructor_name}
                            rating={c.rating}
                            priority={i === 0}
                          />
                        ))}
                      </HorizontalScroll>
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
                            aria-hidden="true"
                          >
                            <Search className="h-8 w-8" style={{ color: colors.text.tertiary }} aria-hidden="true" />
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
            </div>
          </AnimatePresence>
        )}
      </PageLayout>
    </div>
  );
}
