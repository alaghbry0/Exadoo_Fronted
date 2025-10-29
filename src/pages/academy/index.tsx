// src/pages/academy/index.tsx
"use client";

import { useMemo, useState, useCallback, useDeferredValue } from "react";
import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import AuthPrompt from "@/domains/auth/components/AuthFab";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { cn } from "@/shared/utils";
import { Search, Bookmark, Layers, Award, BookOpen } from "lucide-react";
import { useTelegram } from "@/shared/context/TelegramContext";
import { useAcademyData } from "@/domains/academy/api";
import { useUserStore } from "@/shared/state/zustand/userStore";
import {
  MiniCourseCard,
  MiniBundleCard,
  CategoryCard,
  SectionHeader,
  HScroll,
  SkeletonCard,
  OngoingCourseCard,
  TopCourseCarousel,
  LatestCourseCard,
} from "@/domains/academy/components";
import { HomeSearchBar } from "@/domains/home/components";
import {
  colors,
  componentRadius,
  gradients,
  shadows,
  withAlpha,
} from "@/styles/tokens";

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

  const { telegramId: tgId } = useTelegram();
  
  // Get user data from store
  const { fullName, photoUrl } = useUserStore();
  const userName = fullName || "User";
  const userInitial = userName.charAt(0).toUpperCase();
  
  // State for hiding/showing name
  const [isNameHidden, setIsNameHidden] = useState(false);
  
  const displayName =
    isNameHidden
      ? "****"
      : (userName.length > 24 ? `${userName.slice(0, 24)}…` : userName);

  const headingStyle = {
    fontFamily: "var(--font-arabic)",
    color: colors.text.primary,
  } as const;

  const supportingTextStyle = {
    fontFamily: "var(--font-arabic)",
    color: colors.text.secondary,
  } as const;

  const navButtonBase = cn(
    "flex flex-col items-center gap-1.5 px-6 py-2 transition-all",
    componentRadius.button,
  );

  return (
    <div
      className="min-h-screen pb-20"
      dir="rtl"
      style={{ backgroundColor: colors.bg.secondary }}
    >
      {/* Header */}
      <div
        role="banner"
        className="sticky top-0 z-50 pt-[env(safe-area-inset-top)] supports-[backdrop-filter]:backdrop-blur-md backdrop-blur-md"
        style={{
          backgroundColor: withAlpha(colors.bg.elevated, 0.92),
          borderBottom: `1px solid ${withAlpha(colors.border.default, 0.7)}`,
          boxShadow: shadows.elevation[1],
        }}
      >
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Avatar + Text */}
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <Avatar
                className="h-11 w-11 sm:h-12 sm:w-12"
                style={{
                  boxShadow: `0 0 0 2px ${withAlpha(colors.brand.primary, 0.2)}`,
                  backgroundColor: withAlpha(colors.brand.primary, 0.08),
                }}
              >
                {/* ✅ صورة افتراضية من public/icon_user.png */}
                <AvatarImage src={photoUrl || "/icon_user.svg"} alt={displayName} />
                <AvatarFallback
                  className="font-semibold"
                  style={{
                    backgroundImage: gradients.brand.primary,
                    color: colors.text.inverse,
                    fontFamily: "var(--font-arabic)",
                  }}
                >
                  {userInitial}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <h1
                  className="truncate text-base font-semibold sm:text-lg"
                  style={headingStyle}
                >
                  {`مرحباً، ${displayName}`}
                </h1>
                <p
                  className="mt-0.5 text-xs sm:text-[13px]"
                  style={supportingTextStyle}
                >
                  رحلتك التعليمية تبدأ من هنا
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 transition hover:opacity-80" aria-hidden="true">
                <Image
                  src="/logo.png"
                  alt="Exaado Logo"
                  width={35}
                  height={35}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mx-auto max-w-screen-xl">
        <HomeSearchBar
          value={q}
          onChange={setQ}
          placeholder="Enter Course Name"
          ariaLabel="بحث في محتوى الأكاديمية"
        />
      </div>

      <main className="px-4" style={{ backgroundColor: colors.bg.secondary }}>

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
            <div
              key={tab}
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
                                subCategoryId={b.sub_category_id}
                                freeSessionsCount={b.free_sessions_count}
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
                  {/* Top Courses Carousel with Auto-Scroll */}
                  {filteredData.topCourses.length > 0 && (
                    <section aria-labelledby="top-courses-carousel" className="mb-8">
                      <h2 className="mb-4 text-2xl font-bold" style={headingStyle}>
                        Top Courses
                      </h2>
                      
                      <TopCourseCarousel
                        courses={filteredData.topCourses.slice(0, 5).map((c) => ({
                          id: c.id,
                          title: c.title,
                          subtitle: c.short_description?.substring(0, 50) || "دورة تعليمية",
                          description: c.short_description || "",
                          thumbnail: c.thumbnail || '/11.png',
                        }))}
                        autoScroll={true}
                        interval={7000}
                      />
                    </section>
                  )}

                  {/* Course Categories */}
                  {filteredData.categories.length > 0 && (
                    <section aria-labelledby="categories" className="mb-8">
                      <h2 className="mb-6 text-2xl font-bold" style={headingStyle}>
                        Course Categories :
                      </h2>
                      
                      <div className="overflow-x-auto pb-4 -mx-4 px-4 hide-scrollbar">
                        <div className="flex gap-3 min-w-max">
                          {filteredData.categories.slice(0, 6).map((cat, i) => (
                            <CategoryCard
                              key={cat.id}
                              {...cat}
                              priority={i === 0}
                            />
                          ))}
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Latest Bundles */}
                  {filteredData.topBundles.length > 0 && (
                    <section aria-labelledby="latest-bundles" className="mb-8">
                      <h2 className="mb-5 text-2xl font-bold" style={headingStyle}>
                        Latest Bundles 🔥
                      </h2>
                      
                      <div className="overflow-x-auto pb-4 -mx-4 px-4 hide-scrollbar">
                        <div className="flex gap-4 min-w-max">
                          {filteredData.topBundles.map((b, i) => (
                            <div key={b.id} className="w-[280px]">
                              <MiniBundleCard
                                id={b.id}
                                title={b.title}
                                desc={b.description}
                                price={b.price}
                                img={b.image || b.cover_image}
                                subCategoryId={b.sub_category_id}
                                freeSessionsCount={b.free_sessions_count}
                                priority={i === 0}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Latest Courses */}
                  {filteredData.highlightCourses.length > 0 && (
                    <section aria-labelledby="latest-courses" className="mb-8">
                      <h2 className="mb-6 text-2xl font-bold" style={headingStyle}>
                        Latest Courses
                      </h2>
                      
                      <div className="overflow-x-auto pb-4 -mx-4 px-4 hide-scrollbar">
                        <div className="flex gap-3 min-w-max">
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
                        </div>
                      </div>
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
      </main>

      {/* Bottom Navigation */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 px-4 py-2 backdrop-blur-xl"
        style={{
          backgroundColor: withAlpha(colors.bg.elevated, 0.95),
          borderTop: `1px solid ${withAlpha(colors.border.default, 0.7)}`,
          boxShadow: shadows.elevation[2],
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)",
        }}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-around">
          <button
            className={navButtonBase}
            style={{
              color: tab === "all" ? colors.brand.primary : colors.text.secondary,
              backgroundColor:
                tab === "all" ? withAlpha(colors.brand.primary, 0.12) : "transparent",
              boxShadow: tab === "all" ? shadows.colored.primary.sm : "none",
            }}
            onClick={() => handleTab("all")}
            aria-label="الصفحة الرئيسية"
            aria-current={tab === "all" ? "page" : undefined}
          >
            <Layers size={22} aria-hidden="true" />
            <span
              className="text-xs font-semibold"
              style={{ fontFamily: "var(--font-arabic)" }}
            >
              Home
            </span>
          </button>

          <button
            className={navButtonBase}
            style={{
              color: tab === "mine" ? colors.brand.primary : colors.text.secondary,
              backgroundColor:
                tab === "mine" ? withAlpha(colors.brand.primary, 0.12) : "transparent",
              boxShadow: tab === "mine" ? shadows.colored.primary.sm : "none",
            }}
            onClick={() => handleTab("mine")}
            aria-label="دوراتي"
            aria-current={tab === "mine" ? "page" : undefined}
          >
            <Bookmark size={22} aria-hidden="true" />
            <span
              className="text-xs font-semibold"
              style={{ fontFamily: "var(--font-arabic)" }}
            >
              My Courses
            </span>
          </button>
        </div>
      </div>

  
      
    </div>
  );
}
