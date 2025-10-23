// src/components/AcademyHeroCard.tsx
"use client";

import Link from "next/link";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface AcademyHeroCardProps {
  className?: string;
}

function AcademyHeroCard({ className }: AcademyHeroCardProps) {
  return (
    <Link
      href="/academy"
      prefetch
      aria-label="الدخول إلى أكاديمية إكسادو"
      // تحسين حالة التركيز (focus) لتكون أوضح
      className={cn(
        "group block rounded-3xl outline-none focus-visible:ring-4 focus-visible:ring-primary-400/50",
        className,
      )}
    >
      <Card
        dir="rtl"
        className={cn(
          "relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm",
          // تحسين تأثير الحركة عند المرور ليكون أكثر سلاسة
          "transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-primary-500/10",
          "dark:border-neutral-800 dark:bg-neutral-900",
        )}
      >
        {/* إضافة تأثير توهج عند المرور */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-gradient-to-br dark:from-primary-500/10 dark:via-transparent dark:to-secondary-500/10" />

        {/* تحسين ألوان وتأثير حركة الخلفيات الضبابية */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-primary-100/80 blur-3xl transition-transform duration-500 group-hover:-translate-x-2 group-hover:-translate-y-2 dark:bg-primary-500/20" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-secondary-500/10 blur-3xl transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2 dark:bg-secondary-600/20" />

        {/* زيادة المساحة الداخلية للبطاقة */}
        <CardContent className="p-8 md:p-10 font-arabic text-gray-800 dark:text-neutral-200">
          <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                {/* تكبير حجم الأيقونة والمربع المحيط بها */}
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-100 text-primary-600 transition-transform duration-300 group-hover:scale-110 dark:bg-primary-500/10 dark:text-primary-400">
                  <GraduationCap className="h-7 w-7" aria-hidden="true" />
                </div>
                {/* تحسين العنوان */}
                <h2
                  id="academy-title"
                  className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-neutral-100 md:text-3xl"
                >
                  أكاديمية إكسادو: انطلق نحو الاحتراف
                </h2>
              </div>

              {/* اقتراح نص وصفي بديل وأكثر جاذبية */}
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-300 md:text-lg">
                حوّل معرفتك إلى مهارات حقيقية. ابدأ رحلتك التعليمية مع مسارات
                عملية وشهادات معتمدة.
              </p>

              {/* زيادة المسافة العلوية للرقائق */}
              <div className=" flex flex-wrap items-center gap-2 text-sm"></div>
            </div>

            <div className="shrink-0">
              <div
                className={cn(
                  "inline-flex h-10 items-center justify-center gap-2 rounded-full px-7 text-sm font-bold text-white",
                  // اقتراح تدرج لوني أكثر حيوية للزر
                  "bg-gradient-to-r from-primary-500 to-primary-700 shadow-lg transition-all duration-300",
                  // تأثير ظل أكثر بروزاً وحركة سهم أكبر عند المرور
                  "group-hover:shadow-2xl group-hover:shadow-primary-500/30",
                )}
                role="button"
                aria-hidden="true"
              >
                {/* اقتراح نص CTA بديل */}
                <span>ابدأ التعلّم الآن</span>
                <ArrowLeft
                  className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1.5"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default AcademyHeroCard;
