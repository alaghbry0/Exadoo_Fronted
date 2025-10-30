// src/pages/academy/index.tsx
"use client";

import {
  useMemo,
  useState,
  useCallback,
  useDeferredValue,
  type ReactNode,
} from "react";
import { AnimatePresence } from "framer-motion";
import { AlertCircle, Award, BookOpen, Bookmark, Layers, Search } from "lucide-react";

import { useAcademyData } from "@/domains/academy/api";
import AuthPrompt from "@/domains/auth/components/AuthFab";
import {
  AcademyRailSection,
  CategoryCard,
  LatestCourseCard,
  MiniBundleCard,
  MiniCourseCard,
  TopCourseCarousel,
} from "@/domains/academy/components";
import { HomeSearchBar, UserHeader } from "@/domains/home/components";
import { EmptyState, SectionHeading } from "@/shared/components/common";
import {
  HorizontalScroll,
  PageLayout,
  buildCountBadge,
} from "@/shared/components/layout";
import { Badge, Card, Tabs, TabsList, TabsTrigger, Button, AcademyCardSkeleton } from "@/shared/components/ui";
import { useTelegram } from "@/shared/context/TelegramContext";
import { cn } from "@/shared/utils";
import {
  animations,
  colors,
  componentRadius,
  fontFamily,
  radius,
  shadowClasses,
  shadows,
  spacing,
  withAlpha,
  semanticSpacing
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

const BOTTOM_TABS = [
  { value: "all", label: "الرئيسية", icon: Layers, ariaLabel: "الانتقال إلى الرئيسية" },
  { value: "mine", label: "دوراتي", icon: Bookmark, ariaLabel: "عرض دوراتي" },
] as const;

const SEARCH_SUGGESTIONS = [
  "تحليل فني",
  "مبتدئ",
  "مجاني",
] as const;




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

  const mySections = useMemo(() => {
    const sections: ReactNode[] = [];

    if (mine.courses.length > 0) {
      sections.push(
        <AcademyRailSection<CourseItem>
          key="my-courses"
          id="my-courses"
          title="دوراتي"
          icon={Bookmark}
          action={buildCountBadge(mine.courses.length)}
          items={mine.courses}
          renderItem={(course, index) => (
            <MiniCourseCard
              id={course.id}
              title={course.title}
              desc={course.short_description}
              price={course.discounted_price || course.price}
              lessons={course.total_number_of_lessons}
              level={course.level}
              img={course.thumbnail}
              free={isFreeCourse(course)}
              priority={index === 0}
            />
          )}
          scrollProps={{ bottomPadding: "lg" }}
        />,
      );
    }

    if (mine.bundles.length > 0) {
      sections.push(
        <AcademyRailSection<BundleItem>
          key="my-bundles"
          id="my-bundles"
          title="حزمي المسجلة"
          icon={Award}
          action={buildCountBadge(mine.bundles.length)}
          items={mine.bundles}
          renderItem={(bundle, index) => (
            <MiniBundleCard
              id={bundle.id}
              title={bundle.title}
              desc={bundle.description}
              price={bundle.price}
              img={bundle.image || bundle.cover_image}
              subCategoryId={bundle.sub_category_id}
              freeSessionsCount={bundle.free_sessions_count}
              priority={index === 0}
            />
          )}
          scrollProps={{ bottomPadding: "lg", itemClassName: "w-[280px]" }}
        />,
      );
    }

    return sections;
  }, [mine]);

  const featuredSections = useMemo(() => {
    const sections: ReactNode[] = [];

    if (filteredData.categories.length > 0) {
      sections.push(
        <AcademyRailSection<CategoryItem>
          key="categories"
          id="categories"
          title="تصنيفات الدورات"
          icon={Layers}
          items={filteredData.categories.slice(0, 6)}
          renderItem={(category, index) => (
            <CategoryCard
              {...category}
              priority={index === 0}
            />
          )}
          scrollProps={{ gap: "sm", bottomPadding: "lg", itemClassName: "w-auto" }}
        />,
      );
    }

    if (filteredData.topBundles.length > 0) {
      sections.push(
        <AcademyRailSection<BundleItem>
          key="latest-bundles"
          id="latest-bundles"
          title="أحدث الباقات 🔥"
          icon={Award}
          items={filteredData.topBundles}
          renderItem={(bundle, index) => (
            <MiniBundleCard
              id={bundle.id}
              title={bundle.title}
              desc={bundle.description}
              price={bundle.price}
              img={bundle.image || bundle.cover_image}
              subCategoryId={bundle.sub_category_id}
              freeSessionsCount={bundle.free_sessions_count}
              priority={index === 0}
            />
          )}
          scrollProps={{ gap: "md", bottomPadding: "lg", itemClassName: "w-[280px]" }}
        />,
      );
    }

    if (filteredData.highlightCourses.length > 0) {
      sections.push(
        <AcademyRailSection<CourseItem>
          key="latest-courses"
          id="latest-courses"
          title="أحدث الدورات"
          icon={BookOpen}
          items={filteredData.highlightCourses.slice(0, 6)}
          renderItem={(course, index) => (
            <LatestCourseCard
              id={course.id}
              title={course.title}
              lessonsCount={course.total_number_of_lessons}
              imageUrl={course.thumbnail}
              price={course.discounted_price || course.price}
              instructorName={course.instructor_name}
              rating={course.rating}
              priority={index === 0}
            />
          )}
          scrollProps={{ gap: "sm", bottomPadding: "lg", itemClassName: "w-auto" }}
        />,
      );
    }

    return sections;
  }, [filteredData]);

  const showContent = Boolean(data) && !isLoading && !isError;
  const showMyEmptyState = mine.courses.length === 0 && mine.bundles.length === 0;

  const resolvedErrorMessage =
    error && typeof error === "object" && "message" in error
      ? String((error as { message?: string }).message ?? "حدث خطأ غير متوقع")
      : error
      ? String(error)
      : "حدث خطأ غير متوقع";

  const handleTab = useCallback((key: "all" | "mine") => setTab(key), []);

  const bottomNavTokens = {
    containerBackground: withAlpha(colors.bg.elevated, 0.95),
    containerBorder: withAlpha(colors.border.default, 0.7),
    activeBackground: withAlpha(colors.brand.primary, 0.12),
    activeShadow: shadows.colored.primary.sm,
    inactiveShadow: "none",
  } as const;

  const bottomNavSurfaceStyle = {
    backgroundColor: bottomNavTokens.containerBackground,
    borderTop: `1px solid ${bottomNavTokens.containerBorder}`,
    boxShadow: shadows.elevation[2],
    paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + ${spacing[3]})`,
  } as const;

  const navTriggerBase = cn(
    "flex flex-col items-center gap-1.5 px-6 py-2 text-xs font-semibold transition-all",
    componentRadius.button,
    shadowClasses.button,
  );

  const getTriggerStyle = (isActive: boolean) =>
    ({
      color: isActive ? colors.brand.primary : colors.text.secondary,
      backgroundColor: isActive
        ? bottomNavTokens.activeBackground
        : "transparent",
      boxShadow: isActive
        ? bottomNavTokens.activeShadow
        : bottomNavTokens.inactiveShadow,
    }) as const;

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
      

      <div>

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

          {isError ? (
            <Card
              aria-live="assertive"
              style={{
                backgroundColor: withAlpha(colors.status.error, 0.08),
                borderColor: withAlpha(colors.status.error, 0.32),
              }}
            >
              <EmptyState
                icon={AlertCircle}
                title="تعذر تحميل المحتوى"
                description={resolvedErrorMessage}
              />
            </Card>
          ) : null}
        </div>

        {showContent ? (
          <AnimatePresence mode="wait">
            <div key={tab} className="space-y-12">
              {tab === "mine" ? (
                showMyEmptyState ? (
                  <Card
                    className="mx-auto max-w-lg border border-dashed"
                    style={{
                      borderColor: withAlpha(colors.border.default, 0.6),
                      backgroundColor: colors.bg.elevated,
                    }}
                  >
                    <EmptyState
                      icon={BookOpen}
                      title="لم تشترك في أي محتوى بعد"
                      description={`اكتشف الأكاديمية وابدأ رحلتك التعليمية من خلال تبويب "جميع المحتوى"`}
                    >
                      <Button
                        className="gap-2"
                        style={{
                          backgroundColor: colors.brand.primary,
                          color: colors.text.inverse,
                          marginTop: spacing[4],
                        }}
                        onClick={() => setTab("all")}
                      >
                        <Layers size={16} aria-hidden="true" />
                        استكشف الدورات الآن
                      </Button>
                    </EmptyState>
                  </Card>
                ) : (
                  <div className="space-y-10">{mySections}</div>
                )
              ) : (
                <>
                  {filteredData.topCourses.length > 0 ? (
                    <section
                      aria-labelledby="top-courses-carousel"
                      style={{ display: "grid", gap: spacing[4] }}
                    >
                      <SectionHeading
                        id="top-courses-carousel"
                        title="أفضل الدورات"
                      />

                      <TopCourseCarousel
                        courses={filteredData.topCourses
                          .slice(0, 2)
                          .map((course) => ({
                            id: course.id,
                            title: course.title,
                            subtitle:
                              course.short_description?.substring(0, 5) ||
                              "دورة تعليمية",
                            description: course.short_description || "",
                            thumbnail: course.thumbnail || "/11.png",
                          }))}
                        autoScroll
                        interval={7000}
                      />
                    </section>
                  ) : null}

                  {featuredSections}

                  {isSearching &&
                  filteredData.topCourses.length === 0 &&
                  filteredData.categories.length === 0 &&
                  filteredData.topBundles.length === 0 &&
                  filteredData.highlightCourses.length === 0 ? (
                    <Card
                      className="mx-auto max-w-lg border border-dashed"
                      style={{
                        borderColor: withAlpha(colors.border.default, 0.6),
                        backgroundColor: colors.bg.elevated,
                      }}
                    >
                      <EmptyState
                        icon={Search}
                        title="لا توجد نتائج"
                        description="جرّب كلمات أبسط أو تصنيفات مختلفة"
                      >
                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                          {SEARCH_SUGGESTIONS.map((suggestion) => (
                            <Badge
                              key={suggestion}
                              variant="secondary"
                              className="px-3 py-1.5 text-xs font-medium"
                              style={{
                                backgroundColor: colors.bg.secondary,
                                color: colors.text.secondary,
                              }}
                            >
                              {suggestion}
                            </Badge>
                          ))}
                        </div>
                      </EmptyState>
                    </Card>
                  ) : null}
                </>
              )}

              <div className="pt-4">
                <AuthPrompt />
              </div>
            </div>
          </AnimatePresence>
        ) : null}
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-40 px-4 pt-3 backdrop-blur-xl"
        style={bottomNavSurfaceStyle}
      >
        <Tabs
          value={tab}
          onValueChange={(value) => handleTab(value as "all" | "mine")}
          aria-label="التنقل داخل محتوى الأكاديمية"
        >
          <TabsList
            className={cn(
              "mx-auto flex h-auto w-full max-w-2xl items-center justify-around gap-3 bg-transparent p-0",
              shadowClasses.none,
            )}
          >
            {BOTTOM_TABS.map((tabConfig) => {
              const Icon = tabConfig.icon;
              const isActive = tab === tabConfig.value;

              return (
                <TabsTrigger
                  key={tabConfig.value}
                  value={tabConfig.value}
                  className={navTriggerBase}
                  style={getTriggerStyle(isActive)}
                  aria-label={tabConfig.ariaLabel}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={22} aria-hidden="true" />
                  <span style={{ fontFamily: fontFamily.arabic }}>
                    {tabConfig.label}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>
    </PageLayout>
    </div>
  );
}

