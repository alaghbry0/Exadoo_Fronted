/**
 * Academy Course Detail Page
 * صفحة تفاصيل الدورة التعليمية
 */

import React, { useEffect, useMemo, useState, ReactNode } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { 
  Loader2, 
  ArrowLeft, 
  Clipboard, 
  MessageCircle, 
  Lock, 
  Play 
} from "lucide-react";
import { colors, spacing } from "@/styles/tokens";
import SmartImage from "@/shared/components/common/SmartImage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import AuthPrompt from "@/features/auth/components/AuthFab";

// Feature Components
import {
  CourseLoadingState,
  CourseErrorState,
  CourseNotFoundState,
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

// Utils & Types
import { formatPrice } from "@/lib/academy";
import type { Course } from "@/types/academy";

/* ==============================
   Sub-Components
============================== */

// CourseHeader Component (shared from Bundle)
interface CourseHeaderProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  onBack?: () => void;
}

function CourseHeader({ title, subtitle, imageUrl, onBack }: CourseHeaderProps) {
  return (
    <div className="relative h-[400px] rounded-b-3xl overflow-hidden">
      <div className="absolute inset-0">
        <SmartImage
          src={imageUrl}
          alt={subtitle}
          fill
          blurType="secondary"
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"></div>
      </div>

      <button
        onClick={onBack}
        className="absolute top-4 left-4 z-10 w-10 h-10 bg-black/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white transition-all hover:bg-black/30"
        aria-label="رجوع"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="absolute top-4 right-4 left-16 z-10 text-white text-center">
        <h1 className="text-xl drop-shadow-lg">{title}</h1>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center text-white z-10">
        <p className="text-sm opacity-90 drop-shadow-lg">(COURSE)</p>
      </div>

      <div 
        className="absolute bottom-6 right-6 rounded-full px-4 py-2 flex items-center shadow-lg z-10"
        style={{
          backgroundColor: colors.bg.primary,
          gap: spacing[2]
        }}
      >
        <span style={{ color: colors.status.error, fontWeight: 600 }}>NEW</span>
        <span>📚</span>
      </div>
    </div>
  );
}

// ContentBadge Component
interface ContentBadgeProps {
  text: string;
}

function ContentBadge({ text }: ContentBadgeProps) {
  return (
    <div 
      className="inline-block rounded-full px-4 py-2 mb-3"
      style={{
        backgroundColor: colors.bg.secondary,
        color: colors.text.secondary
      }}
    >
      {text}
    </div>
  );
}

// LessonItem Component
interface LessonItemProps {
  title: string;
  duration: string;
  isLocked?: boolean;
  isFree?: boolean;
  isVideo?: boolean;
  courseId?: string;
  lessonId?: string;
}

function LessonItem({ title, duration, isLocked, isFree, isVideo, courseId, lessonId }: LessonItemProps) {
  const canWatch = isVideo && !isLocked && courseId && lessonId;
  
  return (
    <div 
      className="flex items-center justify-between py-4 border-b"
      style={{ borderColor: colors.border.default }}
    >
      <div className="flex items-center flex-1" style={{ gap: spacing[3] }}>
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: isLocked ? colors.bg.secondary : colors.brand.primary
          }}
        >
          {isLocked ? (
            <Lock size={18} style={{ color: colors.text.tertiary }} />
          ) : (
            <Play size={18} className="text-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate" style={{ color: colors.text.primary }}>
            {title}
          </p>
          <div className="flex items-center" style={{ gap: spacing[2] }}>
            <span className="text-xs" style={{ color: colors.text.tertiary }}>
              {duration}
            </span>
            {isFree && (
              <span 
                className="text-xs rounded-full px-2 py-0.5"
                style={{
                  backgroundColor: colors.status.success,
                  color: colors.text.inverse
                }}
              >
                مجاني
              </span>
            )}
          </div>
        </div>
      </div>
      
      {canWatch && (
        <a
          href={`/academy/watch?courseId=${courseId}&lessonId=${lessonId}&lessonTitle=${encodeURIComponent(title)}`}
          className="text-xs rounded-md border px-3 py-1.5 font-semibold transition-colors flex-shrink-0"
          style={{
            borderColor: colors.border.default,
            color: colors.text.primary
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.bg.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          مشاهدة
        </a>
      )}
      {isLocked && (
        <span className="text-xs flex-shrink-0" style={{ color: colors.text.tertiary }}>
          مغلق
        </span>
      )}
    </div>
  );
}

// SectionItem Component for organizing lessons
interface SectionItemProps {
  title: string;
  lessons: any[];
  courseId: string;
  isEnrolled: boolean;
}

function SectionItem({ title, lessons, courseId, isEnrolled }: SectionItemProps) {
  return (
    <div 
      className="rounded-xl border overflow-hidden mb-4"
      style={{ borderColor: colors.border.default }}
    >
      <div 
        className="px-4 py-3 font-bold"
        style={{
          backgroundColor: colors.bg.secondary,
          color: colors.text.primary
        }}
      >
        {title}
      </div>
      <div style={{ backgroundColor: colors.bg.primary }}>
        {lessons.map((lesson, index) => {
          const isVideo = (lesson.lesson_type || "").toLowerCase() === "video";
          const locked = !isEnrolled || lesson.user_validity === false;
          
          return (
            <LessonItem
              key={lesson.id || index}
              title={lesson.title || `الدرس ${index + 1}`}
              duration={lesson.duration || "00:00:00"}
              isLocked={locked}
              isFree={index === 0 && !isEnrolled}
              isVideo={isVideo}
              courseId={courseId}
              lessonId={lesson.id}
            />
          );
        })}
      </div>
    </div>
  );
}

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

  // Extract all sections with lessons
  const sections = useMemo(() => {
    if (!details?.sections) return [];
    return details.sections;
  }, [details]);
  
  // Extract simple lessons from description for non-enrolled users
  const simpleLessons = useMemo(() => {
    if (!course?.description) return [];
    const lines = course.description.split('\n');
    const lessonLines = lines.filter(line => 
      line.trim().match(/^\d+[.-]/) || 
      line.trim().match(/^الدرس/) ||
      line.trim().match(/^الفصل/)
    );
    return lessonLines.slice(0, 10); // Show first 10 lesson titles
  }, [course]);

  // Calculate total hours
  const totalHours = useMemo(() => {
    if (!details?.sections) return "00:00:00";
    let totalSeconds = 0;
    details.sections.forEach((section: any) => {
      if (section.lessons) {
        section.lessons.forEach((lesson: any) => {
          if (lesson.duration) {
            const parts = lesson.duration.split(':');
            totalSeconds += parseInt(parts[0] || 0) * 3600 + parseInt(parts[1] || 0) * 60 + parseInt(parts[2] || 0);
          }
        });
      }
    });
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [details]);

  return (
    <div dir="rtl" className="min-h-screen" style={{ backgroundColor: colors.bg.primary }}>
      {/* Course Header */}
      <CourseHeader
        title={course.title}
        subtitle={course.title}
        imageUrl={course.thumbnail || "/image.jpg"}
        onBack={() => router.push("/academy")}
      />

      {/* Content */}
      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Price */}
        <div className="flex items-center justify-center mb-6" style={{ 
          gap: spacing[2],
          color: colors.text.primary 
        }}>
          <span className="text-xl">💰</span>
          <span>سعر الدورة: {formatPrice(course.price)}</span>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="content" className="mb-6">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="content">المحتوى</TabsTrigger>
            <TabsTrigger value="output">المخرجات</TabsTrigger>
            <TabsTrigger value="requirements">المتطلبات</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-6">
            {/* Course Content Card */}
            <Card className="p-6 mb-6" style={{ backgroundColor: colors.bg.elevated }}>
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ color: colors.text.primary }}>محتوى الدورة</h3>
                <Clipboard size={24} style={{ color: colors.brand.primary }} />
              </div>

              <div className="space-y-3">
                <ContentBadge text={`${totalHours} ساعات من الفيديو عند الطلب`} />
                <ContentBadge text={`${course.total_number_of_lessons} درس`} />
                <ContentBadge text="فيديوهات عالية الجودة" />
                <ContentBadge text="وصول مدى الحياة" />
              </div>
            </Card>

            {/* Course Content Details - All Lessons */}
            <div className="mb-6">
              <h3 className="mb-4" style={{ color: colors.text.primary }}>
                المنهج الدراسي
              </h3>

              {/* For enrolled users: show all sections with lessons */}
              {isEnrolled && sections.length > 0 ? (
                <div>
                  {sections.map((section: any) => (
                    <SectionItem
                      key={section.id}
                      title={section.title}
                      lessons={section.lessons || []}
                      courseId={id}
                      isEnrolled={isEnrolled}
                    />
                  ))}
                </div>
              ) : (
                /* For non-enrolled users: show simple list */
                <div 
                  className="rounded-xl border p-4"
                  style={{
                    backgroundColor: colors.bg.primary,
                    borderColor: colors.border.default
                  }}
                >
                  {simpleLessons.length > 0 ? (
                    simpleLessons.map((lesson, index) => (
                      <div 
                        key={index}
                        className="flex items-center py-3 border-b"
                        style={{ borderColor: colors.border.default }}
                      >
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: index === 0 ? colors.brand.primary : colors.bg.secondary,
                            marginLeft: spacing[3]
                          }}
                        >
                          {index === 0 ? (
                            <Play size={14} className="text-white" />
                          ) : (
                            <Lock size={14} style={{ color: colors.text.tertiary }} />
                          )}
                        </div>
                        <span style={{ color: colors.text.primary }}>
                          {lesson.trim()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: colors.text.secondary }}>
                      {course.total_number_of_lessons} درس متاح بعد التسجيل
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            {course.short_description && (
              <div className="mb-6">
                <h3 className="mb-4" style={{ color: colors.text.primary }}>
                  الوصف
                </h3>
                <p 
                  className="leading-relaxed whitespace-pre-line"
                  style={{ color: colors.text.secondary }}
                >
                  {course.short_description}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="output" className="mt-6">
            <Card className="p-6" style={{ backgroundColor: colors.bg.elevated }}>
              <div className="flex items-center mb-4" style={{ gap: spacing[3] }}>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: colors.status.warning }}
                >
                  <span className="text-white text-xl">🎯</span>
                </div>
                <h3 style={{ color: colors.text.primary }}>ماذا ستتعلم</h3>
              </div>
              
              {course.outcomes && course.outcomes.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.outcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start" style={{ gap: spacing[2] }}>
                      <span 
                        className="inline-block w-5 h-5 mt-0.5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: `${colors.status.success}25`,
                          color: colors.status.success
                        }}
                      >
                        ✓
                      </span>
                      <span style={{ color: colors.text.secondary }}>
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
            <Card className="p-6" style={{ backgroundColor: colors.bg.elevated }}>
              <div className="flex items-center mb-4" style={{ gap: spacing[3] }}>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: colors.brand.primary }}
                >
                  <span className="text-white text-xl">📋</span>
                </div>
                <h3 style={{ color: colors.text.primary }}>المتطلبات</h3>
              </div>
              
              {course.requirements && course.requirements.length > 0 ? (
                <ul className="space-y-3">
                  {course.requirements.map((req, index) => (
                    <li key={index} className="flex items-start" style={{ gap: spacing[2] }}>
                      <span 
                        className="inline-block w-5 h-5 mt-0.5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: `${colors.brand.primary}25`,
                          color: colors.brand.primary
                        }}
                      >
                        •
                      </span>
                      <span style={{ color: colors.text.secondary }}>
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
        className="fixed bottom-0 left-0 right-0 p-4 shadow-lg z-20"
        style={{ 
          backgroundColor: colors.bg.primary,
          borderTop: `1px solid ${colors.border.default}`
        }}
      >
        <div className="max-w-2xl mx-auto">
          <Button 
            onClick={onEnrollClick}
            className="w-full rounded-xl py-6"
            style={{
              backgroundColor: colors.brand.primary,
              color: colors.text.inverse
            }}
          >
            {isEnrolled ? "انتقل للدورة" : `سجّل الآن 🔥 - ${formatPrice(course.price)}`}
          </Button>
        </div>
      </div>

      <AcademyPurchaseModal />
      <AuthPrompt />
    </div>
  );
}
