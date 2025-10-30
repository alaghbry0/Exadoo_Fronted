/**
 * Course Header Component
 * رأس صفحة تفاصيل الكورس مع الشارات والبيانات الاجتماعية
 */

import React from "react";
import { ArrowLeft, Star, Users, Award } from "lucide-react";
import SmartImage from "@/shared/components/common/SmartImage";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { colors, spacing, componentRadius, shadowClasses, withAlpha } from "@/styles/tokens";
import { cn } from "@/shared/utils";

interface CourseHeaderProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  level?: string;
  rating?: number;
  numberOfRatings?: number;
  totalEnrollment?: number;
  isNew?: boolean;
  isEnrolled?: boolean;
  onBack?: () => void;
  onContinueLearning?: () => void;
}

export default function CourseHeader({
  title,
  subtitle,
  imageUrl,
  level = "beginner",
  rating = 0,
  numberOfRatings = 0,
  totalEnrollment = 0,
  isNew = false,
  isEnrolled = false,
  onBack,
  onContinueLearning,
}: CourseHeaderProps) {
  const levelLabels: Record<string, string> = {
    beginner: "مبتدئ",
    intermediate: "متوسط",
    advanced: "متقدم",
  };

  const levelColors: Record<string, string> = {
    beginner: colors.status.success,
    intermediate: colors.status.warning,
    advanced: colors.status.error,
  };

  return (
    <div className="relative h-[420px] rounded-b-3xl overflow-hidden">
      {/* Background Image */}
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
        {/* Gradient Overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, ${withAlpha(colors.bg.primary, 0.4)} 0%, transparent 30%, transparent 60%, ${withAlpha(colors.bg.primary, 0.85)} 100%)`
          }}
        />
      </div>

      {/* Back Button */}
      <button
        onClick={onBack}
        className={cn(
          "absolute top-4 left-4 z-10 w-10 h-10 backdrop-blur-md flex items-center justify-center text-white transition-all",
          componentRadius.button,
          shadowClasses.button
        )}
        style={{
          backgroundColor: withAlpha(colors.bg.primary, 0.3)
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = withAlpha(colors.bg.primary, 0.5);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = withAlpha(colors.bg.primary, 0.3);
        }}
        aria-label="رجوع"
      >
        <ArrowLeft size={24} />
      </button>

      {/* Top Badges */}
      <div 
        className="absolute top-4 right-4 z-10 flex items-center"
        style={{ gap: spacing[2] }}
      >
        {isNew && (
          <Badge
            className={cn("font-bold", shadowClasses.cardElevated)}
            style={{
              backgroundColor: colors.status.error,
              color: colors.text.inverse,
              padding: `${spacing[1]} ${spacing[3]}`
            }}
          >
            NEW
          </Badge>
        )}
        
        <Badge
          className={cn("font-semibold", shadowClasses.cardElevated)}
          style={{
            backgroundColor: levelColors[level] || colors.brand.primary,
            color: colors.text.inverse,
            padding: `${spacing[1]} ${spacing[3]}`
          }}
        >
          {levelLabels[level] || level}
        </Badge>
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-6">
        {/* Title */}
        <h1 
          className="text-2xl font-bold mb-3 drop-shadow-lg line-clamp-2"
          style={{ color: colors.text.inverse }}
        >
          {title}
        </h1>

        {/* Social Proof */}
        <div 
          className="flex items-center flex-wrap mb-4"
          style={{ gap: spacing[4] }}
        >
          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center" style={{ gap: spacing[1] }}>
              <Star 
                size={18} 
                fill={colors.status.warning}
                style={{ color: colors.status.warning }}
                aria-hidden="true"
              />
              <span 
                className="font-semibold"
                style={{ color: colors.text.inverse }}
              >
                {rating.toFixed(1)}
              </span>
              <span 
                className="text-sm"
                style={{ color: withAlpha(colors.text.inverse, 0.8) }}
              >
                ({numberOfRatings})
              </span>
            </div>
          )}

          {/* Enrollment */}
          {totalEnrollment > 0 && (
            <div className="flex items-center" style={{ gap: spacing[1] }}>
              <Users 
                size={18} 
                style={{ color: colors.text.inverse }}
                aria-hidden="true"
              />
              <span 
                className="text-sm font-medium"
                style={{ color: withAlpha(colors.text.inverse, 0.9) }}
              >
                {totalEnrollment} مشترك
              </span>
            </div>
          )}
        </div>

        {/* Enrolled Badge & Continue Button */}
        {isEnrolled && (
          <div 
            className="flex items-center flex-wrap"
            style={{ gap: spacing[3] }}
          >
            <Badge
              className={cn("font-semibold", shadowClasses.cardElevated)}
              style={{
                backgroundColor: colors.status.success,
                color: colors.text.inverse,
                padding: `${spacing[2]} ${spacing[4]}`
              }}
            >
              <Award size={16} className="ml-1" aria-hidden="true" />
              مشترك
            </Badge>

            {onContinueLearning && (
              <Button
                onClick={onContinueLearning}
                className={cn("font-semibold", shadowClasses.cardElevated)}
                style={{
                  backgroundColor: colors.brand.primary,
                  color: colors.text.inverse,
                  padding: `${spacing[2]} ${spacing[4]}`
                }}
              >
                تابع من حيث توقفت ➜
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
