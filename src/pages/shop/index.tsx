// src/pages/shop/index.tsx
"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "@/shared/components/layout/PageLayout";
import AuthPrompt from "@/features/auth/components/AuthFab";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { componentVariants, mergeVariants } from "@/components/ui/variants";
// import { ServiceCard } from '@/shared/components/common/EnhancedCard' // غير مستخدم
import {
  TrendingUp,
  BarChart3,
  Search,
  ArrowLeft,
  Sparkles,
  Zap,
  Lock,
} from "lucide-react";
import AcademyHeroCard from "@/components/AcademyHeroCard";
import { useTelegram } from "@/context/TelegramContext";
import { useIndicatorsData } from "@/services/indicators";
import { useDebounce } from "@/hooks/useDebounce";
import { useKeyboardSearch } from "@/hooks/useKeyboardSearch";
import {
  HalfCardSkeleton,
  WideCardSkeleton,
} from "@/shared/components/common/SkeletonLoaders";
// import { GridSkeleton } from '@/shared/components/common/LoadingStates' // غير مستخدم
import { useUserStore } from "@/stores/zustand/userStore";
import { useUIStore } from "@/stores/zustand/uiStore";
import { useUnifiedSearchHook } from "@/hooks/useUnifiedSearch"; // ⬅️ جديد
import { useAcademyData } from "@/services/academy"; // ⬅️ جديد

// =========================================
// Types, Data, Helpers
// =========================================
type Variant = "half" | "wide";
type Accent = "primary" | "secondary" | "success";

interface TileMeta {
  key: string;
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  variant: Variant;
  accent: Accent;
  live?: boolean;
  eyebrow?: string;
}

const TRADING_TOOLS: TileMeta[] = [
  {
    key: "signals",
    title: "Exaado Signals",
    description: "إشارات لحظية مدروسة تعزز قراراتك وتقلل الضوضاء.",
    href: "/shop/signals",
    icon: TrendingUp,
    variant: "half",
    accent: "secondary",
    live: true,
  },
  {
    key: "indicators",
    title: "مؤشرات Exaado للبيع والشراء",
    description: "حزمة مؤشرات متقدمة (Gann-based) بأداء مُثبت وتجربة سلسة.",
    href: "/indicators",
    icon: BarChart3,
    variant: "wide",
    accent: "primary",
  },
  {
    key: "forex",
    title: "Exaado Forex",
    description:
      "تحكم كامل في صفقاتك مع لوحات Exaado للتداول. نفّذ أوامرك بنقرة واحدة، أدر مخاطرك بفعالية، وركز على الأهم: تحقيق الأرباح.",
    href: "/forex",
    icon: TrendingUp,
    variant: "half",
    accent: "primary",
  },
];
const ALL_SERVICES = [...TRADING_TOOLS];

const iconWrap = (accent: Accent): string =>
  ({
    primary:
      "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400",
    secondary:
      "bg-secondary-50 text-secondary-700 dark:bg-secondary-500/10 dark:text-secondary-400",
    success:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  })[accent];

const ringFocus = (accent: Accent): string =>
  ({
    primary: "focus-visible:ring-2 focus-visible:ring-primary-400/50",
    secondary: "focus-visible:ring-2 focus-visible:ring-secondary-400/50",
    success: "focus-visible:ring-2 focus-visible:ring-emerald-400/50",
  })[accent];

// =========================================
// Locked wrapper
// =========================================
const LockedServiceWrapper: React.FC<{
  isLocked: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ isLocked, children, className }) => {
  const { openAuthPrompt } = useUIStore();

  if (!isLocked) return <div className={className}>{children}</div>;

  const handleInteraction = () => openAuthPrompt("locked");

  return (
    <div
      className={cn("relative cursor-pointer group", className)}
      onClick={handleInteraction}
      onKeyDown={(e) =>
        (e.key === "Enter" || e.key === " ") && handleInteraction()
      }
      role="button"
      tabIndex={0}
      aria-label="هذه الخدمة مقفلة. اضغط لربط حسابك."
    >
      <div
        className="absolute inset-0 bg-neutral-800/30 dark:bg-black/50 z-10 rounded-card-lg flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        aria-hidden="true"
      >
        <div className="flex items-center gap-2 bg-black/60 text-white px-4 py-2 rounded-full backdrop-blur-sm">
          <Lock className="w-4 h-4" />
          <span className="font-bold text-sm">يتطلب ربط الحساب</span>
        </div>
      </div>
      <div
        className="absolute top-4 right-4 z-20 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm p-2 rounded-full shadow-md"
        aria-hidden="true"
      >
        <Lock className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
      </div>
      <div className="filter grayscale opacity-60 transition-all duration-300 pointer-events-none">
        {children}
      </div>
    </div>
  );
};

// =========================================
// Cards
// =========================================
const HalfCard = React.memo<{ meta: TileMeta }>(({ meta }) => (
  <Link
    href={meta.href}
    className={cn(
      "group block h-full rounded-card-lg outline-none",
      ringFocus(meta.accent),
    )}
    aria-label={meta.title}
    prefetch={false}
  >
    <Card
      className={cn(
        componentVariants.card.base,
        componentVariants.card.elevated,
        componentVariants.card.interactive,
        "flex flex-col h-full rounded-card-lg",
      )}
    >
      <CardContent className="p-5 flex flex-col flex-grow">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "h-12 w-12 rounded-2xl grid place-items-center shrink-0",
              iconWrap(meta.accent),
            )}
          >
            <meta.icon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-neutral-100">
                {meta.title}
              </h3>
              {meta.live && (
                <span
                  className="relative inline-flex h-3 w-3"
                  aria-label="خدمة نشطة"
                >
                  <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping bg-red-400" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm text-gray-600 dark:text-neutral-300 leading-relaxed">
              {meta.description}
            </p>
          </div>
        </div>
        <div className="mt-auto pt-4">
          <div className="text-sm font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1 transition-all duration-200 group-hover:gap-2">
            عرض التفاصيل
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-[-4px]" />
          </div>
        </div>
      </CardContent>
    </Card>
  </Link>
));
HalfCard.displayName = "HalfCard";

const WideIndicators = React.memo<{ meta: TileMeta }>(({ meta }) => {
  const { telegramId } = useTelegram();
  const isLinked = useUserStore((s) => s.isLinked);

  const indicatorsTelegramId = isLinked && telegramId ? telegramId : undefined;
  const { data, isLoading } = useIndicatorsData(indicatorsTelegramId);

  const lifetime = data?.subscriptions?.find(
    (p: any) => p?.duration_in_months === "0",
  );
  const priceNow = lifetime?.discounted_price ?? lifetime?.price;
  const priceOld =
    lifetime?.discounted_price && lifetime.discounted_price !== lifetime.price
      ? lifetime.price
      : undefined;
  const discount =
    priceOld && priceNow
      ? Math.round(
          ((Number(priceOld) - Number(priceNow)) / Number(priceOld)) * 100,
        )
      : null;

  return (
    <Link
      href={meta.href}
      className={cn(
        "group block rounded-card-lg outline-none",
        ringFocus(meta.accent),
      )}
      aria-label={meta.title}
      prefetch={false}
    >
      <Card
        className={cn(
          componentVariants.card.base,
          componentVariants.card.elevated,
          componentVariants.card.interactive,
          "rounded-card-lg",
        )}
      >
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div
              className={cn(
                "h-12 w-12 rounded-2xl grid place-items-center shrink-0",
                iconWrap(meta.accent),
              )}
            >
              <meta.icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-neutral-100">
                  {meta.title}
                </h3>
                {discount !== null && (
                  <Badge variant="destructive" className="font-bold">
                    خصم {discount}%
                  </Badge>
                )}
              </div>
              <p className="mt-1.5 text-sm text-gray-600 dark:text-neutral-300 leading-relaxed">
                {meta.description}
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mb-1">
                خطة مدى الحياة تبدأ من
              </p>
              {isLoading || !isLinked ? (
                <div className="h-8 w-24 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse" />
              ) : (
                <div className="flex items-baseline gap-2">
                  {priceNow && (
                    <span className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">
                      ${Number(priceNow).toFixed(0)}
                    </span>
                  )}
                  {priceOld && (
                    <span className="text-base text-gray-400 line-through">
                      ${Number(priceOld).toFixed(0)}
                    </span>
                  )}
                </div>
              )}
            </div>
            <Button
              size="lg"
              className="rounded-xl w-full sm:w-auto font-bold bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-700 shadow-button transition-all duration-300 text-white"
            >
              تفاصيل المؤشرات
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:translate-x-[-4px]" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});
WideIndicators.displayName = "WideIndicators";

const WideConsultations = React.memo<{ meta: TileMeta }>(({ meta }) => (
  <Link
    href={meta.href}
    className={cn(
      "group block rounded-card-lg outline-none",
      ringFocus(meta.accent),
    )}
    aria-label={meta.title}
    prefetch={false}
  >
    <Card
      className={cn(
        componentVariants.card.base,
        "rounded-card-lg transition-all duration-200 group-hover: -hover group-hover:-translate-y-0.5 dark:",
      )}
    >
      <CardContent className="p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div
              className={cn(
                "h-12 w-12 rounded-2xl grid place-items-center shrink-0",
                iconWrap(meta.accent),
              )}
            >
              <meta.icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-neutral-100">
                  {meta.title}
                </h3>
                {meta.eyebrow && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-none dark:bg-emerald-900/50 dark:text-emerald-300">
                    {meta.eyebrow}
                  </Badge>
                )}
              </div>
              <p className="mt-1.5 text-sm text-gray-600 dark:text-neutral-300 leading-relaxed max-w-lg">
                {meta.description}
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <Button
              variant="outline"
              className="rounded-xl w-full sm:w-auto border-gray-500 dark:border-neutral-700 font-semibold"
            >
              احجز الآن
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </Link>
));
WideConsultations.displayName = "WideConsultations";

// =========================================
// Main Page
// =========================================
export default function ShopHome() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  const { isLinked } = useUserStore();
  const { telegramId } = useTelegram();

  // بيانات الأكاديمية لاستخدامها في البحث الموحّد
  const { data: academyData } = useAcademyData(telegramId || undefined);

  // اختصارات لوحة المفاتيح
  useKeyboardSearch({ inputRef, query, onClear: () => setQuery("") });

  // البحث الموحّد: خدمات + أكاديمية
  const { result, isSearching } = useUnifiedSearchHook({
    query: debouncedQuery,
    services: ALL_SERVICES.map((s) => ({
      key: s.key,
      title: s.title,
      description: s.description,
      href: s.href,
    })),
    academyData,
    isLinked,
    perSectionLimit: 8,
  });
  const isDebouncing = query !== debouncedQuery;

  // عرض بطاقة خدمة مع احترام القفل
  const renderService = (meta: TileMeta) => {
    const isLocked = meta.key !== "signals" && !isLinked;
    const href = isLocked ? "#" : meta.href;

    let component: React.ReactNode;
    if (meta.variant === "half") {
      component = <HalfCard meta={{ ...meta, href }} />;
    } else if (meta.key === "indicators") {
      component = <WideIndicators meta={{ ...meta, href }} />;
    } else if (meta.key === "consultations") {
      component = <WideConsultations meta={{ ...meta, href }} />;
    } else {
      // الافتراضي
      component = <HalfCard meta={{ ...meta, href }} />;
    }

    return (
      <LockedServiceWrapper
        key={meta.key}
        isLocked={isLocked}
        className={
          meta.variant === "half" ? "col-span-12 sm:col-span-6" : "col-span-12"
        }
      >
        {component}
      </LockedServiceWrapper>
    );
  };

  // عرض عنصر نتيجة موحّدة (خدمات/كورسات/حزم/تصنيفات)
  const renderUnifiedHit = (hit: any) => {
    const doc = hit.item;
    if (doc.kind === "service") {
      const meta = TRADING_TOOLS.find((m) => m.key === doc.id);
      if (!meta) return null;
      return renderService(meta);
    }

    if (doc.kind === "course") {
      return (
        <Link
          key={`c-${doc.id}`}
          href={doc.href}
          className="group block col-span-12 sm:col-span-6 lg:col-span-4"
          prefetch={false}
        >
          <Card
            className={cn(componentVariants.card.base, "rounded-card-lg dark:")}
          >
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 mb-1">دورة</div>
              <div className="font-bold text-gray-900 dark:text-neutral-100 line-clamp-1">
                {doc.title}
              </div>
              <div className="text-sm text-gray-600 dark:text-neutral-300 line-clamp-2 mt-1">
                {doc.subtitle}
              </div>
              <div className="mt-3 text-primary-600 dark:text-primary-400 text-sm font-semibold flex items-center gap-1">
                التفاصيل <ArrowLeft className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
      );
    }

    if (doc.kind === "bundle") {
      return (
        <Link
          key={`b-${doc.id}`}
          href={doc.href}
          className="group block col-span-12 sm:col-span-6 lg:col-span-4"
          prefetch={false}
        >
          <Card
            className={cn(componentVariants.card.base, "rounded-card-lg dark:")}
          >
            <CardContent className="p-4">
              <div className="text-sm text-amber-600 mb-1">حزمة</div>
              <div className="font-bold text-gray-900 dark:text-neutral-100 line-clamp-1">
                {doc.title}
              </div>
              <div className="text-sm text-gray-600 dark:text-neutral-300 line-clamp-2 mt-1">
                {doc.subtitle}
              </div>
              <div className="mt-3 text-primary-600 dark:text-primary-400 text-sm font-semibold flex items-center gap-1">
                التفاصيل <ArrowLeft className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
      );
    }

    if (doc.kind === "category") {
      return (
        <Link
          key={`g-${doc.id}`}
          href={doc.href}
          className="group block col-span-12 sm:col-span-6 lg:col-span-3"
          prefetch={false}
        >
          <Card
            className={cn(componentVariants.card.base, "rounded-card-lg dark:")}
          >
            <CardContent className="p-4">
              <div className="text-xs text-gray-500">تصنيف</div>
              <div className="font-bold text-gray-900 dark:text-neutral-100 line-clamp-1 mt-1">
                {doc.title}
              </div>
              <div className="mt-3 text-primary-600 dark:text-primary-400 text-sm font-semibold flex items-center gap-1">
                تصفّح <ArrowLeft className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
      );
    }

    return null;
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gray-50 text-gray-800 dark:bg-neutral-950 dark:text-neutral-200 font-arabic"
    >
      <PageLayout maxWidth="2xl">
        {/* Hero */}
        <section
          className="text-center pt-20 pb-12"
          aria-labelledby="page-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1
              id="page-title"
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-neutral-100 mb-4 leading-tight font-display"
            >
              متجر Exaado
            </h1>
            <p className="text-lg text-gray-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
              أدواتك وخدماتك للوصول إلى مستوى جديد في عالم التداول. استكشف،
              تعلم، ونفّذ.
            </p>
          </motion.div>
        </section>

        {/* Search input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-8 max-w-2xl mx-auto"
          role="search"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              ref={inputRef}
              type="search"
              placeholder="ابحث في الخدمات + الأكاديمية… (مثال: تحليل، مؤشرات، دورة)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={cn(
                "block w-full pl-12 pr-4 py-3.5 rounded-2xl text-base",
                "bg-white border border-gray-200 shadow-sm",
                "text-gray-900 placeholder:text-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400",
                "transition-shadow duration-200",
                "dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder:text-neutral-500",
              )}
              aria-label="بحث موحّد في متجر إكسادو والأكاديمية"
            />
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isSearching ? "search-results" : "categories"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isSearching ? (
              <section id="search-results" aria-label="نتائج البحث">
                {isDebouncing ? (
                  <div className="grid grid-cols-12 gap-4 sm:gap-5">
                    <div className="col-span-12">
                      <WideCardSkeleton />
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                      <HalfCardSkeleton />
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                      <HalfCardSkeleton />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Services */}
                    {result.sections.services.length > 0 && (
                      <div className="mb-6">
                        <h3 className="mb-3 text-lg font-bold">الخدمات</h3>
                        <div className="grid grid-cols-12 gap-4 sm:gap-5">
                          {result.sections.services.map(renderUnifiedHit)}
                        </div>
                      </div>
                    )}

                    {/* Courses */}
                    {result.sections.courses.length > 0 && (
                      <div className="mb-6">
                        <h3 className="mb-3 text-lg font-bold">الكورسات</h3>
                        <div className="grid grid-cols-12 gap-4 sm:gap-5">
                          {result.sections.courses.map(renderUnifiedHit)}
                        </div>
                      </div>
                    )}

                    {/* Bundles */}
                    {result.sections.bundles.length > 0 && (
                      <div className="mb-6">
                        <h3 className="mb-3 text-lg font-bold">الحزم</h3>
                        <div className="grid grid-cols-12 gap-4 sm:gap-5">
                          {result.sections.bundles.map(renderUnifiedHit)}
                        </div>
                      </div>
                    )}

                    {/* Categories */}
                    {result.sections.categories.length > 0 && (
                      <div className="mb-6">
                        <h3 className="mb-3 text-lg font-bold">التصنيفات</h3>
                        <div className="grid grid-cols-12 gap-4 sm:gap-5">
                          {result.sections.categories.map(renderUnifiedHit)}
                        </div>
                      </div>
                    )}

                    {/* Empty */}
                    {result.stats.total === 0 && (
                      <div className="col-span-12 text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-neutral-800 mb-4">
                          <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 dark:text-neutral-400">
                          لا توجد نتائج مطابقة لكلمة البحث &quot;{query}&quot;
                        </p>
                      </div>
                    )}
                  </>
                )}
              </section>
            ) : (
              <div className="space-y-8">
                <AuthPrompt />

                <section id="education" aria-labelledby="education-title">
                  <div className="flex items-center gap-2 mb-5">
                    <Sparkles className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    <h2
                      id="education-title"
                      className="text-2xl font-bold text-gray-900 dark:text-neutral-100"
                    >
                      التعليم والتطوير
                    </h2>
                  </div>
                  <LockedServiceWrapper isLocked={!isLinked}>
                    <AcademyHeroCard />
                  </LockedServiceWrapper>
                </section>

                <section
                  id="trading-tools"
                  aria-labelledby="trading-tools-title"
                >
                  <div className="flex items-center gap-2 mb-5">
                    <Zap className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    <h2
                      id="trading-tools-title"
                      className="text-2xl font-bold text-gray-900 dark:text-neutral-100"
                    >
                      أدوات التداول
                    </h2>
                  </div>
                  <div className="grid grid-cols-12 gap-4 sm:gap-5">
                    {TRADING_TOOLS.map((meta) => renderService(meta))}
                  </div>
                </section>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="max-w-7xl mx-auto mt-12" />
      </PageLayout>
    </div>
  );
}
