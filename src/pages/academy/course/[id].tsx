/**
 * Academy Course Detail Page
 * صفحة تفاصيل الدورة التعليمية - محسّنة
 */

import React, { useMemo } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import {
  Loader2,
  Clock,
  BookOpen,
  Award,
  CheckCircle2
} from "lucide-react";
import { colors, spacing, componentRadius, shadowClasses, withAlpha } from "@/styles/tokens";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/utils";

import AuthPrompt from "@/domains/auth/components/AuthFab";

// Feature Components
import {
  CourseLoadingState,
  CourseErrorState,
  CourseNotFoundState,
} from "@/domains/academy/components";

// Local Components
import CourseHeader from "./components/CourseHeader";
import RealCurriculum from "./components/RealCurriculum";

// Dynamic Imports
const AcademyPurchaseModal = dynamic(
  () => import("@/domains/academy/components/AcademyPurchaseModal"),
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
import { useAcademyData } from "@/domains/academy/api";
import { useCourseDetails } from "@/domains/academy/api";
import { useTelegram } from "@/shared/context/TelegramContext";

// Utils & Types
import { formatPrice } from "@/domains/academy/utils";
import type { Course } from "@/domains/academy/types";

/* ==============================
   Helper Functions
============================== */

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

  const course: Course | undefined = useMemo(
    () => data?.courses.find((c: Course) => c.id === id),
    [data, id],
  );

  const isEnrolled = useMemo(
    () => Boolean(data?.my_enrollments?.course_ids?.includes?.(id)),
    [data, id],
  );


  const sections = useMemo(() => {
    return details?.sections ?? [];
  }, [details]);

  // Find first incomplete lesson
  const firstIncompleteLesson = useMemo(() => {
    if (!details?.sections || !isEnrolled) return null;
    
    for (const section of details.sections) {
      for (const lesson of section.lessons || []) {
        if (lesson.is_completed !== 1 && lesson.user_validity !== false) {
          return {
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            sectionTitle: section.title
          };
        }
      }
    }
    return null;
  }, [details, isEnrolled]);

  const totalHours = useMemo(() => {
    if (!details?.sections) return "00:00:00";
    let totalSeconds = 0;
    details.sections.forEach((section: any) => {
      if (section.lessons) {
        section.lessons.forEach((lesson: any) => {
          if (lesson.duration) {
            const parts = lesson.duration.split(":");
            totalSeconds +=
              parseInt(parts[0] || 0, 10) * 3600 +
              parseInt(parts[1] || 0, 10) * 60 +
              parseInt(parts[2] || 0, 10);
          }
        });
      }
    });
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [details]);

  // Loading & Error States
  if (isLoading) return <CourseLoadingState />;
  if (isError) return <CourseErrorState message={(error as Error)?.message} />;
  if (!course) return <CourseNotFoundState />;

  const handleContinueLearning = () => {
    if (firstIncompleteLesson) {
      router.push({
        pathname: "/academy/watch",
        query: {
          courseId: id,
          lessonId: firstIncompleteLesson.lessonId,
          lessonTitle: firstIncompleteLesson.lessonTitle,
        },
      });
    } else if (sections.length > 0 && sections[0].lessons?.length > 0) {
      // إذا لم يوجد درس غير مكتمل، انتقل للدرس الأول
      const firstLesson = sections[0].lessons[0];
      router.push({
        pathname: "/academy/watch",
        query: {
          courseId: id,
          lessonId: firstLesson.id,
          lessonTitle: firstLesson.title,
        },
      });
    }
  };

  const onEnrollClick = () => {
    if (isEnrolled) {
      handleContinueLearning();
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
    <div dir="rtl" className="min-h-screen" style={{ backgroundColor: colors.bg.primary }}>
      {/* Course Header */}
      <CourseHeader
        title={course.title}
        subtitle={course.title}
        imageUrl={course.thumbnail || "/image.jpg"}
        level={course.level}
        rating={details?.rating || course.rating}
        numberOfRatings={details?.number_of_ratings}
        totalEnrollment={details?.total_enrollment || course.total_enrollment}
        isNew={details?.is_top_course === "1"}
        isEnrolled={isEnrolled}
        onBack={() => router.push("/academy")}
        onContinueLearning={isEnrolled ? handleContinueLearning : undefined}
      />

      {/* Content */}
      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Quick Stats */}
        <div 
          className={cn("p-4 mb-6", componentRadius.card, shadowClasses.card)}
          style={{
            backgroundColor: colors.bg.elevated,
            border: `1px solid ${colors.border.default}`
          }}
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div 
                className="flex items-center justify-center mb-2"
                style={{ color: colors.brand.primary }}
              >
                <BookOpen size={24} aria-hidden="true" />
              </div>
              <div 
                className="text-2xl font-bold"
                style={{ color: colors.text.primary }}
              >
                {course.total_number_of_lessons}
              </div>
              <div 
                className="text-xs"
                style={{ color: colors.text.tertiary }}
              >
                درس
              </div>
            </div>
            
            <div>
              <div 
                className="flex items-center justify-center mb-2"
                style={{ color: colors.status.warning }}
              >
                <Clock size={24} aria-hidden="true" />
              </div>
              <div 
                className="text-2xl font-bold"
                style={{ color: colors.text.primary }}
              >
                {totalHours.split(":")[0]}
              </div>
              <div 
                className="text-xs"
                style={{ color: colors.text.tertiary }}
              >
                ساعة
              </div>
            </div>
            
            <div>
              <div 
                className="flex items-center justify-center mb-2"
                style={{ color: colors.status.success }}
              >
                <Award size={24} aria-hidden="true" />
              </div>
              <div 
                className="text-2xl font-bold"
                style={{ color: colors.text.primary }}
              >
                {formatPrice(course.discounted_price || course.price)}
              </div>
              <div 
                className="text-xs"
                style={{ color: colors.text.tertiary }}
              >
                السعر
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="curriculum" className="mb-6">
          <TabsList 
            className="w-full grid grid-cols-3"
            style={{
              backgroundColor: colors.bg.secondary,
              padding: spacing[1]
            }}
          >
            <TabsTrigger 
              value="curriculum"
              className={componentRadius.button}
            >
              المنهج
            </TabsTrigger>
            <TabsTrigger 
              value="outcomes"
              className={componentRadius.button}
            >
              المخرجات
            </TabsTrigger>
            <TabsTrigger 
              value="requirements"
              className={componentRadius.button}
            >
              المتطلبات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="curriculum" className="mt-6">
            {/* Description */}
            {course.short_description && (
              <Card 
                className={cn("p-6 mb-6", componentRadius.card, shadowClasses.card)}
                style={{ 
                  backgroundColor: colors.bg.elevated,
                  border: `1px solid ${colors.border.default}`
                }}
              >
                <h3 
                  className="mb-3 font-bold text-lg"
                  style={{ color: colors.text.primary }}
                >
                  نظرة عامة
                </h3>
                <p 
                  className="leading-relaxed whitespace-pre-line"
                  style={{ color: colors.text.secondary }}
                >
                  {course.short_description}
                </p>
              </Card>
            )}

            {/* Course Curriculum */}
            <div className="mb-6">
              <h3 
                className="mb-4 font-bold text-lg"
                style={{ color: colors.text.primary }}
              >
                المنهج الدراسي
              </h3>

              {isEnrolled && sections.length > 0 ? (
                <RealCurriculum
                  courseId={id}
                  sections={sections}
                />
              ) : (
                <Card 
                  className={cn("p-6 text-center", componentRadius.card, shadowClasses.card)}
                  style={{
                    backgroundColor: colors.bg.elevated,
                    border: `1px dashed ${colors.border.default}`
                  }}
                >
                  <div 
                    className="w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                    style={{
                      backgroundColor: withAlpha(colors.brand.primary, 0.1),
                      borderRadius: componentRadius.full
                    }}
                  >
                    <BookOpen 
                      size={32} 
                      style={{ color: colors.brand.primary }}
                      aria-hidden="true"
                    />
                  </div>
                  <p 
                    className="font-semibold mb-2"
                    style={{ color: colors.text.primary }}
                  >
                    {course.total_number_of_lessons} درس متاح
                  </p>
                  <p 
                    className="text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    سجّل في الدورة للوصول إلى جميع الدروس
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="outcomes" className="mt-6">
            <Card 
              className={cn("p-6", componentRadius.card, shadowClasses.card)}
              style={{ 
                backgroundColor: colors.bg.elevated,
                border: `1px solid ${colors.border.default}`
              }}
            >
              <div className="flex items-center mb-6" style={{ gap: spacing[3] }}>
                <div 
                  className={cn(
                    "w-12 h-12 flex items-center justify-center",
                    componentRadius.card
                  )}
                  style={{ backgroundColor: withAlpha(colors.status.success, 0.15) }}
                >
                  <CheckCircle2 
                    size={24} 
                    style={{ color: colors.status.success }}
                    aria-hidden="true"
                  />
                </div>
                <h3 
                  className="font-bold text-lg"
                  style={{ color: colors.text.primary }}
                >
                  ماذا ستتعلم
                </h3>
              </div>
              
              {course.outcomes && course.outcomes.length > 0 ? (
                <ul className="grid grid-cols-1 gap-3">
                  {course.outcomes.map((outcome, index) => (
                    <li 
                      key={index} 
                      className={cn("flex items-start p-3", componentRadius.button)}
                      style={{ 
                        gap: spacing[3],
                        backgroundColor: colors.bg.secondary
                      }}
                    >
                      <span 
                        className={cn(
                          "inline-flex w-6 h-6 mt-0.5 items-center justify-center flex-shrink-0",
                          componentRadius.full
                        )}
                        style={{
                          backgroundColor: withAlpha(colors.status.success, 0.2),
                          color: colors.status.success
                        }}
                      >
                        ✓
                      </span>
                      <span 
                        className="leading-relaxed"
                        style={{ color: colors.text.primary }}
                      >
                        {outcome}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: colors.text.secondary }}>
                  سوف تكتسب مهارات ومعارف قيمة في هذا المجال
                </p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="requirements" className="mt-6">
            <Card 
              className={cn("p-6", componentRadius.card, shadowClasses.card)}
              style={{ 
                backgroundColor: colors.bg.elevated,
                border: `1px solid ${colors.border.default}`
              }}
            >
              <div className="flex items-center mb-6" style={{ gap: spacing[3] }}>
                <div 
                  className={cn(
                    "w-12 h-12 flex items-center justify-center",
                    componentRadius.card
                  )}
                  style={{ backgroundColor: withAlpha(colors.brand.primary, 0.15) }}
                >
                  <BookOpen 
                    size={24} 
                    style={{ color: colors.brand.primary }}
                    aria-hidden="true"
                  />
                </div>
                <h3 
                  className="font-bold text-lg"
                  style={{ color: colors.text.primary }}
                >
                  المتطلبات
                </h3>
              </div>
              
              {course.requirements && course.requirements.length > 0 ? (
                <ul className="grid grid-cols-1 gap-3">
                  {course.requirements.map((req, index) => (
                    <li 
                      key={index} 
                      className={cn("flex items-start p-3", componentRadius.button)}
                      style={{ 
                        gap: spacing[3],
                        backgroundColor: colors.bg.secondary
                      }}
                    >
                      <span 
                        className={cn(
                          "inline-flex w-6 h-6 mt-0.5 items-center justify-center flex-shrink-0",
                          componentRadius.full
                        )}
                        style={{
                          backgroundColor: withAlpha(colors.brand.primary, 0.2),
                          color: colors.brand.primary,
                          fontSize: "1.25rem",
                          fontWeight: "bold"
                        }}
                      >
                        •
                      </span>
                      <span 
                        className="leading-relaxed"
                        style={{ color: colors.text.primary }}
                      >
                        {req}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: colors.text.secondary }}>
                  لا توجد متطلبات مسبقة - مناسب للمبتدئين
                </p>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Spacer for fixed button */}
        <div className="h-24"></div>
      </div>

      {/* Fixed Enroll Button */}
      <div 
        className={cn("fixed bottom-0 left-0 right-0 p-4 z-20", shadowClasses.modal)}
        style={{ 
          backgroundColor: withAlpha(colors.bg.primary, 0.98),
          borderTop: `1px solid ${colors.border.default}`,
          backdropFilter: "blur(8px)"
        }}
      >
        <div className="max-w-2xl mx-auto">
          <Button 
            onClick={onEnrollClick}
            className={cn("w-full py-6 font-bold text-lg", componentRadius.button, shadowClasses.button)}
            style={{
              backgroundColor: colors.brand.primary,
              color: colors.text.inverse
            }}
          >
            {isEnrolled ? "أكمل التعلم ➡️" : `سجّل الآن 🔥 - ${formatPrice(course.discounted_price || course.price)}`}
          </Button>
        </div>
      </div>

      <AcademyPurchaseModal />
      <AuthPrompt />
    </div>
  );
}
