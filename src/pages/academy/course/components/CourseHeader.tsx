/**
 * Course Header Component
 * رأس صفحة تفاصيل الكورس مع الشارات والبيانات الاجتماعية
 */

import React from "react";
import { ArrowLeft, Star, Users, Award } from "lucide-react";
import SmartImage from "@/shared/components/common/SmartImage";
import { Badge } from "@/shared/components/ui/badge";
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
              lazy
              
              loaderType="skeleton"
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

          {/* Top Badges */}
      <div 
        className="absolute top-4 right-4 z-10 flex items-center"
        style={{ gap: spacing[2] }}
      >
        
      </div>
    
          <div className="absolute top-4 right-4 left-16 z-10 text-white text-center">
            <h1 className="text-xl drop-shadow-lg">{title}</h1>
          </div>
    
          <div className="absolute bottom-8 left-0 right-0 text-center text-white z-10">
            <p className="text-sm opacity-90 drop-shadow-lg">(COURSE)</p>
          </div>
      
    
         
           {isNew && (
             <div 
            className="absolute bottom-6 right-6 rounded-full px-4 py-2 flex items-center shadow-lg z-10"
            style={{
              backgroundColor: colors.bg.primary,
              gap: spacing[2]
            }}
          >
         <span style={{ color: colors.status.error, fontWeight: 600 }}>NEW</span>
         </div>
        )}
          
        </div>
      );
}


