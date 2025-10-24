// src/pages/academy/bundle/[id].tsx
"use client";

import React, { useMemo, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { useAcademyData } from "@/services/academy";
import { useTelegram } from "@/context/TelegramContext";
import AuthPrompt from "@/features/auth/components/AuthFab";
import SmartImage from "@/shared/components/common/SmartImage";
import { Card } from "@/components/ui/card";
const AcademyPurchaseModal = dynamic(
  () => import("@/features/academy/components/AcademyPurchaseModal"),
  { ssr: false },
);
import PageLayout from "@/shared/components/layout/PageLayout";
import { Breadcrumbs } from "@/shared/components/common/Breadcrumbs";
import { PageLoader } from "@/shared/components/common/LoadingStates";
import { EmptyState } from "@/shared/components/common/EmptyState";
import { ArrowLeft, Layers, Sparkles, Package, BookOpen } from "lucide-react";
import SubscribeFab from "@/components/SubscribeFab";
import { colors, spacing } from "@/styles/tokens";
import { MiniCourseCard } from "./components/MiniCourseCard";
import { TitleMetaBundle } from "./components/TitleMetaBundle";
import { StickyHeader } from "./components/StickyHeader";
import { BundleFeaturesSidebar } from "./components/BundleFeaturesSidebar";
import { HScroll } from "./components/HScroll";

/* ==============================
   Types
============================== */
interface Course {
  id: string;
  title: string;
  instructor_name?: string;
  total_number_of_lessons: number;
  thumbnail?: string;
  level?: string;
  price?: string;
  is_free_course?: string | null;
  short_description?: string;
}
interface Bundle {
  id: string;
  title: string;
  description?: string;
  cover_image?: string;
  image?: string;
  price: string;
  course_ids: string;
  free_sessions_count?: string;
  telegram_url?: string;
}

/* ==============================
   Helpers
============================== */
const isFreeCourse = (c: Pick<Course, "price" | "is_free_course">) =>
  (c.is_free_course ?? "") === "1" || c.price?.toLowerCase?.() === "free";

const formatPrice = (value?: string) => {
  if (!value) return "";
  if (value.toLowerCase?.() === "free") return "مجاني";
  const n = Number(value);
  return isNaN(n) ? value : `$${n.toFixed(0)}`;
};


/* ==============================
   Page
============================== */
export default function BundleDetail() {
  const router = useRouter();
  const id = (router.query.id as string) || "";
  const { telegramId } = useTelegram();
  const { data, isLoading, isError, error } = useAcademyData(
    telegramId || undefined,
  );

  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 60]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.05]);

  const bundle: Bundle | undefined = useMemo(
    () => data?.bundles.find((b: Bundle) => b.id === id),
    [data, id],
  );

  const coursesInBundle: Course[] = useMemo(() => {
    if (!data || !bundle) return [];
    try {
      const ids = new Set<string>(JSON.parse(bundle.course_ids));
      return data.courses.filter((c: Course) => ids.has(c.id));
    } catch {
      return [];
    }
  }, [data, bundle]);

  const isEnrolled =
    Boolean((data as any)?.my_enrollments?.bundle_ids?.includes?.(id)) || false;
  const isFree =
    bundle?.price?.toLowerCase?.() === "free" || Number(bundle?.price) === 0;

  const onCTA = () => {
    if (isEnrolled) {
      router.push(`/academy/bundle/${id}`);
      return;
    }
    window.dispatchEvent(
      new CustomEvent("open-subscribe", {
        detail: {
          productType: "bundle",
          productId: id,
          title: bundle?.title,
          price: bundle?.price,
          telegramUrl: bundle?.telegram_url?.trim() || null,
        },
      }),
    );
  };

  if (isLoading) return <PageLoader />;

  if (isError)
    return (
      <EmptyState
        icon={Package}
        title="تعذّر التحميل"
        description={(error as Error)?.message}
      />
    );

  if (!bundle && !isLoading)
    return (
      <EmptyState
        icon={Package}
        title="لم يتم العثور على الحزمة"
        description="عذرًا، الحزمة المطلوبة غير متوفرة"
      />
    );

  if (!bundle) return null;

  return (
    <div
      dir="rtl"
      className="font-arabic min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-800 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-neutral-200"
    >
      <PageLayout maxWidth="full">
        {/* Sticky header */}
        <StickyHeader
          title={bundle.title}
          price={bundle.price}
          visible={showSticky}
          onCTA={onCTA}
        />

        <main className="pb-28">
          {/* ===== HERO (صورة فقط + بارالاكس خفيف) ===== */}
          <header
            ref={heroRef}
            className="relative w-full overflow-hidden text-white pt-20 md:pt-24 pb-16"
          >
            <motion.div
              style={{ y, scale }}
              className="absolute inset-0 will-change-transform"
            >
              <SmartImage
                src={bundle.cover_image || bundle.image || "/image.jpg"}
                alt={bundle.title}
                fill
                blurType="secondary"
                className="object-cover"
                sizes="100vw"
                priority
              />
            </motion.div>

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

            {/* تدرجات خفيفة لتحسين القراءة */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/35 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/25 to-transparent" />

            {/* Floaty stat chip */}
            <div className="relative z-10 mx-auto mt-24 sm:mt-32 max-w-6xl px-4">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                  <Layers className="h-4 w-4 opacity-90" />
                  {coursesInBundle.length} دورات تدريبية
                </span>
              </div>
            </div>
          </header>

          {/* Breadcrumbs */}
          <div className="max-w-6xl mx-auto px-4 py-4">
            <Breadcrumbs
              items={[
                { label: "الرئيسية", href: "/" },
                { label: "الأكاديمية", href: "/academy" },
                { label: bundle.title },
              ]}
            />
          </div>

          {/* ===== Title & CTA (زجاجية) ===== */}
          <TitleMetaBundle
            bundle={bundle}
            coursesCount={coursesInBundle.length}
            onCTA={onCTA}
          />

          {/* ===== المحتوى ===== */}
          <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* الوصف */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="rounded-3xl backdrop-blur-xl shadow-lg"
                  style={{
                    backgroundColor: `${colors.bg.elevated}B3`,
                    border: `1px solid ${colors.border.default}CC`,
                    padding: `${spacing[6]} ${spacing[8]}`,
                  }}
                >
                  <div
                    className="mb-4 flex items-center"
                    style={{ gap: spacing[4] }}
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: colors.brand.primary }}
                    >
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold" style={{ color: colors.text.primary }}>
                      عن الحزمة
                    </h2>
                  </div>
                  <p
                    className="whitespace-pre-line text-base leading-relaxed"
                    style={{ color: colors.text.secondary }}
                  >
                    {(bundle.description || "").replace(/\\r\\n/g, "\n")}
                  </p>
                </motion.div>
              </div>

              {/* مميزات الحزمة (Sidebar) */}
              <aside className="lg:col-span-1">
                <BundleFeaturesSidebar
                  bundle={bundle}
                  coursesCount={coursesInBundle.length}
                />
              </aside>
            </div>

            {/* الدورات المتضمنة */}
            {coursesInBundle.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-12"
              >
                <div
                  className="mb-6 flex items-center"
                  style={{ gap: spacing[4] }}
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${colors.brand.primary} 0%, ${colors.brand.primaryHover} 100%)`,
                    }}
                  >
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2
                      className="text-2xl font-bold md:text-3xl"
                      style={{ color: colors.text.primary }}
                    >
                      الدورات المتضمنة
                    </h2>
                    <p className="text-sm" style={{ color: colors.text.secondary }}>
                      {coursesInBundle.length} دورات تدريبية متكاملة
                    </p>
                  </div>
                </div>

                <HScroll>
                  {coursesInBundle.map((course, i) => (
                    <MiniCourseCard
                      key={course.id}
                      id={course.id}
                      title={course.title}
                      desc={course.short_description}
                      lessons={course.total_number_of_lessons}
                      level={course.level}
                      img={course.thumbnail}
                      free={isFreeCourse(course)}
                      price={course.price}
                      priority={i === 0}
                    />
                  ))}
                </HScroll>
              </motion.div>
            )}
          </div>
        </main>

        {/* FAB للموبايل */}
        <div className="lg:hidden">
          <SubscribeFab
            isEnrolled={isEnrolled}
            isFree={isFree}
            price={bundle.price}
            formatPrice={formatPrice}
            onClick={onCTA}
          />
        </div>

        <AcademyPurchaseModal />
        <AuthPrompt />
      </PageLayout>
    </div>
  );
}
