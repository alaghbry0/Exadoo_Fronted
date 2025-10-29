// src/pages/academy/bundle/[id].tsx
"use client";

import React, { useMemo, useEffect, useRef, useState, ReactNode } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { useAcademyData } from "@/domains/academy/api";
import { useTelegram } from "@/shared/context/TelegramContext";
import AuthPrompt from "@/domains/auth/components/AuthFab";
import SmartImage from "@/shared/components/common/SmartImage";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
const AcademyPurchaseModal = dynamic(
  () => import("@/domains/academy/components/AcademyPurchaseModal"),
  { ssr: false },
);
import PageLayout from "@/shared/components/layout/PageLayout";
import { PageLoader } from "@/shared/components/ui/loaders";
import { EmptyState } from "@/shared/components/common/EmptyState";
import { 
  ArrowLeft, 
  Package, 
  BookOpen, 
  MessageCircle, 
  Users, 
  Headphones, 
  Tag, 
  Crown,
  ChevronRight
} from "lucide-react";
import { colors, spacing } from "@/styles/tokens";


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
   Sub-Components
============================== */

// CourseHeader Component
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
        <p className="text-sm opacity-90 drop-shadow-lg">(BUNDLE)</p>
      </div>

      <div 
        className="absolute bottom-6 right-6 rounded-full px-4 py-2 flex items-center shadow-lg z-10"
        style={{
          backgroundColor: colors.bg.primary,
          gap: spacing[2]
        }}
      >
        <span style={{ color: colors.status.error, fontWeight: 600 }}>NEW</span>
        <span>👨‍🎓</span>
      </div>
    </div>
  );
}

// CourseFeature Component
interface CourseFeatureProps {
  icon: ReactNode;
  title: string;
  description: string;
}

function CourseFeature({ icon, title, description }: CourseFeatureProps) {
  return (
    <div 
      className="rounded-2xl p-4 flex"
      style={{ 
        backgroundColor: colors.bg.secondary,
        gap: spacing[4]
      }}
    >
      <div 
        className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: colors.bg.primary }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="mb-1 font-semibold" style={{ color: colors.text.primary }}>
          {title}
        </h3>
        <p className="text-sm" style={{ color: colors.text.secondary }}>
          {description}
        </p>
      </div>
    </div>
  );
}

// CourseListItem Component
interface CourseListItemProps {
  title: string;
  icon: string;
  onClick?: () => void;
}

function CourseListItem({ title, icon, onClick }: CourseListItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center py-4 border-b transition-colors"
      style={{
        gap: spacing[3],
        borderColor: colors.border.default
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.bg.secondary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white"
        style={{
          background: `linear-gradient(135deg, ${colors.brand.primary} 0%, ${colors.brand.primaryHover} 100%)`
        }}
      >
        {icon}
      </div>
      <span className="flex-1 text-right" style={{ color: colors.text.primary }}>
        {title}
      </span>
      <ChevronRight size={20} style={{ color: colors.text.tertiary }} />
    </button>
  );
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
    <div dir="rtl" className="min-h-screen" style={{ backgroundColor: colors.bg.primary }}>
      {/* Course Header with Image */}
      <CourseHeader
        title={bundle.title}
        subtitle={bundle.title}
        imageUrl={bundle.cover_image || bundle.image || "/image.jpg"}
        onBack={() => router.push("/academy")}
      />

      {/* Content */}
      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Premium Badge */}
        <div className="flex items-center justify-center mb-6" style={{ gap: spacing[2] }}>
          <Crown size={24} style={{ color: colors.text.secondary }} />
          <h2 style={{ color: colors.text.primary }}>{bundle.title}</h2>
        </div>

        {/* Description */}
        <div className="mb-6 text-center space-y-1" style={{ color: colors.text.secondary }}>
          {(bundle.description || "").split("\n").map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          <CourseFeature
            icon={<BookOpen size={24} style={{ color: colors.brand.primary }} />}
            title="محتوى تعليمي غني"
            description={`ستحصل على ${coursesInBundle.length} دورات تدريبية مع ${coursesInBundle.reduce((acc, c) => acc + c.total_number_of_lessons, 0)} درس`}
          />
          
          {parseInt(bundle.free_sessions_count || "0") > 0 && (
            <CourseFeature
              icon={
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: colors.brand.primary }}
                >
                  zoom
                </div>
              }
              title="استشارات مجانية"
              description={`ستحصل على ${bundle.free_sessions_count} جلسات مباشرة مع خبير أكسادو 💙`}
            />
          )}
          
          {bundle.telegram_url?.trim() && (
            <CourseFeature
              icon={<Users size={24} style={{ color: colors.brand.primary }} />}
              title="مجموعة نقاش"
              description="احصل على دخول لمجموعة النقاش الخاصة وندوات أسبوعية"
            />
          )}
          
          <CourseFeature
            icon={<Headphones size={24} style={{ color: colors.brand.primary }} />}
            title="دعم فني 24/7"
            description="احصل على دعم من خبراء أكسادو في أي وقت"
          />
          
          <CourseFeature
            icon={<Tag size={24} style={{ color: colors.brand.primary }} />}
            title="السعر الإجمالي"
            description={formatPrice(bundle.price)}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="courses" className="mb-6">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="courses">الدورات</TabsTrigger>
            <TabsTrigger value="output">المخرجات</TabsTrigger>
            <TabsTrigger value="requirements">المتطلبات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses" className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <BookOpen size={24} style={{ color: colors.brand.primary }} />
              <h3 style={{ color: colors.text.primary }}>الدورات المتضمنة</h3>
            </div>
            
            <div className="space-y-0">
              {coursesInBundle.map((course) => (
                <CourseListItem
                  key={course.id}
                  title={course.title}
                  icon="📚"
                  onClick={() => router.push(`/academy/course/${course.id}`)}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="output" className="mt-6">
            <div 
              className="p-6 rounded-xl"
              style={{ backgroundColor: colors.bg.elevated }}
            >
              <div className="flex items-center mb-4" style={{ gap: spacing[3] }}>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: colors.status.warning }}
                >
                  <span className="text-white text-xl">🎯</span>
                </div>
                <h3 style={{ color: colors.text.primary }}>ماذا ستتعلم في هذه الحزمة</h3>
              </div>
              
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li className="flex items-start" style={{ gap: spacing[2] }}>
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
                    إتقان {coursesInBundle.length} دورات تدريبية شاملة في مجال واحد
                  </span>
                </li>
                <li className="flex items-start" style={{ gap: spacing[2] }}>
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
                    تطبيق عملي على {coursesInBundle.reduce((acc, c) => acc + c.total_number_of_lessons, 0)} درس تفاعلي
                  </span>
                </li>
                <li className="flex items-start" style={{ gap: spacing[2] }}>
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
                    الحصول على شهادات معتمدة لكل دورة في الحزمة
                  </span>
                </li>
                <li className="flex items-start" style={{ gap: spacing[2] }}>
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
                    بناء portfolio عملي ومشاريع حقيقية
                  </span>
                </li>
                <li className="flex items-start" style={{ gap: spacing[2] }}>
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
                    التفاعل المباشر مع المدربين والمجتمع
                  </span>
                </li>
                <li className="flex items-start" style={{ gap: spacing[2] }}>
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
                    وصول مدى الحياة لجميع المحتويات والتحديثات
                  </span>
                </li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="requirements" className="mt-6">
            <div 
              className="p-6 rounded-xl"
              style={{ backgroundColor: colors.bg.elevated }}
            >
              <div className="flex items-center mb-4" style={{ gap: spacing[3] }}>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: colors.brand.primary }}
                >
                  <span className="text-white text-xl">📋</span>
                </div>
                <h3 style={{ color: colors.text.primary }}>المتطلبات</h3>
              </div>
              
              <ul className="space-y-3">
                <li className="flex items-start" style={{ gap: spacing[2] }}>
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
                    جهاز كمبيوتر أو هاتف ذكي متصل بالإنترنت
                  </span>
                </li>
                <li className="flex items-start" style={{ gap: spacing[2] }}>
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
                    الرغبة في التعلم والالتزام بإكمال الدورات
                  </span>
                </li>
                <li className="flex items-start" style={{ gap: spacing[2] }}>
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
                    لا توجد متطلبات مسبقة - مناسب لجميع المستويات
                  </span>
                </li>
                <li className="flex items-start" style={{ gap: spacing[2] }}>
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
                    ساعات كافية للتطبيق العملي على المشاريع
                  </span>
                </li>
              </ul>
              
              <div 
                className="mt-6 p-4 rounded-lg"
                style={{
                  backgroundColor: `${colors.brand.primary}10`,
                  borderRight: `4px solid ${colors.brand.primary}`
                }}
              >
                <p style={{ color: colors.text.secondary }}>
                  💡 <strong>نصيحة:</strong> هذه الحزمة مصممة لتأخذك من المبتدئ إلى المحترف خطوة بخطوة. 
                  كل ما تحتاجه هو الالتزام والرغبة في التعلم!
                </p>
              </div>
            </div>
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
            onClick={onCTA}
            className="w-full rounded-xl py-6"
            style={{
              backgroundColor: colors.brand.primary,
              color: colors.text.inverse
            }}
          >
            {isEnrolled ? "الانتقال للدورة" : `اشترك الآن 🔥 - ${formatPrice(bundle.price)}`}
          </Button>
        </div>
      </div>

      <AcademyPurchaseModal />
      <AuthPrompt />
    </div>
  );
}
