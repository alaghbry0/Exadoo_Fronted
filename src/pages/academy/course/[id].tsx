/**
 * Academy Course Detail Page
 * صفحة تفاصيل الدورة التعليمية
 */

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { colors } from "@/styles/tokens";

import AuthPrompt from "@/features/auth/components/AuthFab";

// Feature Components
import {
  CourseLoadingState,
  CourseErrorState,
  CourseNotFoundState,
  CourseHero,
  CourseTabContent,
} from "@/features/academy/components";

// Dynamic Imports
const AcademyPurchaseModal = dynamic(
  () => import("@/features/academy/components/AcademyPurchaseModal"),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    ),
  },
);

// Services & Hooks
import { useAcademyData } from "@/services/academy";
import { useCourseDetails } from "@/services/courseDetails";
import { useTelegram } from "@/context/TelegramContext";

// UI Components
import SubscribeFab from "@/components/SubscribeFab";
import { Breadcrumbs } from "@/shared/components/common/Breadcrumbs";
import TabsBlock from "@/pages/academy/course/components/TabsBlock";
import CourseSidebar from "@/pages/academy/course/components/CourseSidebar";
import StickyHeader from "@/pages/academy/course/components/StickyHeader";
import TitleMeta from "@/pages/academy/course/components/TitleMeta";

// Utils & Types
import { formatPrice } from "@/lib/academy";
import type { Course, TabId } from "@/types/academy";

export default function CourseDetail() {
  const router = useRouter();
  const id = (router.query.id as string) || "";
  const { telegramId } = useTelegram();

  const { data, isLoading, isError, error } = useAcademyData(
    telegramId || undefined,
  );
  const { data: details } = useCourseDetails(
    telegramId || undefined,
    id || undefined,
  );

  const [activeTab, setActiveTab] = useState<TabId>("curriculum");
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowSticky(window.scrollY > 500);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const course: Course | undefined = useMemo(
    () => data?.courses.find((c: Course) => c.id === id),
    [data, id],
  );

  const isEnrolled = useMemo(
    () => Boolean(data?.my_enrollments?.course_ids?.includes?.(id)),
    [data, id],
  );


  const progress = useMemo(() => {
    if (!course || !isEnrolled) return 0;
    let hash = 0;
    for (let i = 0; i < course.id.length; i++)
      hash = (hash * 31 + course.id.charCodeAt(i)) % 997;
    const normalized = 35 + (hash % 60);
    return Math.min(100, normalized);
  }, [course, isEnrolled]);

  // Loading & Error States
  if (isLoading) return <CourseLoadingState />;
  if (isError) return <CourseErrorState message={(error as Error)?.message} />;
  if (!course) return <CourseNotFoundState />;

  const isFree =
    (course.is_free_course ?? "") === "1" ||
    course.price?.toLowerCase?.() === "free";

  const onEnrollClick = () => {
    if (isEnrolled) {
      // تنقل داخلي
      router.push(`/academy/course/${course.id}`);
    } else {
      window.dispatchEvent(
        new CustomEvent("open-subscribe", {
          detail: {
            productType: "course",
            productId: course.id,
            title: course.title,
            price: course.price,
          },
        }),
      );
    }
  };

  return (
    <div
      dir="rtl"
      className="font-arabic min-h-screen bg-gradient-to-br"
      style={{
        backgroundImage: `linear-gradient(to bottom right, ${colors.bg.secondary}, ${colors.bg.primary}, ${colors.bg.secondary})`,
        color: colors.text.primary,
      }}
    >
      <StickyHeader
        course={course}
        isEnrolled={isEnrolled}
        visible={showSticky}
        onCTA={onEnrollClick}
      />

      <main className="pb-28">
        {/* HERO */}
        <CourseHero course={course} />

        {/* Breadcrumbs */}
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Breadcrumbs
            items={[
              { label: "الرئيسية", href: "/" },
              { label: "الأكاديمية", href: "/academy" },
              { label: course.title },
            ]}
          />
        </div>

        {/* Title + Meta */}
        <TitleMeta course={course} isEnrolled={isEnrolled} />

        {/* المحتوى */}
        <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-x-12">
            <section className="lg:col-span-2">
              <TabsBlock activeTab={activeTab} setActiveTab={setActiveTab} />
              
              <CourseTabContent
                activeTab={activeTab}
                course={course}
                isEnrolled={isEnrolled}
                courseId={id}
                details={details}
              />
            </section>

            <CourseSidebar
              course={course}
              isEnrolled={isEnrolled}
              progress={progress}
              onEnrollClick={onEnrollClick}
            />
          </div>
        </div>
      </main>

      {/* FAB للموبايل */}
      <div className="lg:hidden">
        <SubscribeFab
          isEnrolled={isEnrolled}
          isFree={isFree}
          price={course.price}
          discountedPrice={course.discounted_price}
          formatPrice={formatPrice}
          onClick={onEnrollClick}
        />
      </div>

      <AcademyPurchaseModal />
      <AuthPrompt />
    </div>
  );
}
