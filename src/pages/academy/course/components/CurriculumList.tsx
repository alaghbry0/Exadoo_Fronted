import React from "react";
import { CheckCircle2, Lock, PlayCircle, Clock, Video } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { colors, spacing } from "@/styles/tokens";

export default function CurriculumList({
  isEnrolled,
  lessonsTitles,
  totalLessons,
  duration,
}: {
  isEnrolled: boolean;
  lessonsTitles: string[];
  totalLessons: number;
  duration?: string;
}) {
  const list = lessonsTitles.length
    ? lessonsTitles.map((t, i) => ({
        title: t,
        duration: "10:00", // يمكن جلب المدة الحقيقية
        type: "video" as const,
        idx: i,
      }))
    : Array.from({ length: totalLessons || 0 }).map((_, i) => ({
        title: `الدرس ${i + 1}`,
        duration: "10:00",
        type: i % 3 === 0 ? ("article" as const) : ("video" as const),
        idx: i,
      }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div
        className="flex justify-between items-center rounded-2xl"
        style={{
          padding: spacing[5],
          backgroundColor: colors.bg.secondary,
        }}
      >
        <div
          className="flex items-center text-sm"
          style={{
            gap: spacing[5],
            color: colors.text.secondary,
          }}
        >
          <span>{totalLessons} درس</span>
          <span>•</span>
          <span>{duration || "--:--"}</span>
        </div>
        {!isEnrolled && (
          <span
            className="text-xs rounded-full"
            style={{
              backgroundColor: `${colors.status.warning}1A`,
              color: colors.status.warning,
              padding: `${spacing[2]} ${spacing[3]}`,
            }}
          >
            المعاينة محدودة
          </span>
        )}
      </div>

      {/* Lessons List */}
      <div
        className="rounded-2xl overflow-hidden backdrop-blur-sm"
        style={{
          border: `1px solid ${colors.border.default}`,
          backgroundColor: `${colors.bg.elevated}80`,
        }}
      >
        {list.map((lesson, index) => {
          const isLocked = !isEnrolled && index > 1;
          const isCompleted = isEnrolled && index < 3;
          const isCurrent = isEnrolled && index === 3;
          const isPreview = !isEnrolled && index <= 1;

          let Icon = PlayCircle;
          if (isLocked) Icon = Lock;
          if (isCompleted) Icon = CheckCircle2;
          if (isPreview) Icon = PlayCircle;

          return (
            <motion.div
              key={lesson.idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b last:border-b-0 group"
              style={{
                borderColor: colors.border.default,
                backgroundColor: isLocked ? `${colors.bg.secondary}80` : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!isLocked) {
                  e.currentTarget.style.backgroundColor = colors.bg.secondary;
                }
              }}
              onMouseLeave={(e) => {
                if (!isLocked) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <button
                className={cn(
                  "w-full p-4 flex items-center justify-between text-right transition-all duration-300",
                  isLocked ? "cursor-not-allowed" : "hover:pr-2",
                )}
                disabled={isLocked}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* Lesson Icon */}
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300"
                    style={{
                      backgroundColor: isLocked
                        ? colors.bg.tertiary
                        : isCompleted
                          ? `${colors.status.success}1A`
                          : isPreview
                            ? `${colors.brand.primary}1A`
                            : `${colors.brand.primary}1A`,
                      color: isLocked
                        ? colors.text.disabled
                        : isCompleted
                          ? colors.status.success
                          : isPreview
                            ? colors.brand.primary
                            : colors.brand.primary,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Lesson Info */}
                  <div className="min-w-0 flex-1 text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="font-medium truncate"
                        style={{
                          color: isLocked ? colors.text.disabled : colors.text.primary,
                        }}
                      >
                        {lesson.title}
                      </span>
                      {lesson.type === "video" && (
                        <Video
                          className="h-3 w-3 flex-shrink-0"
                          style={{ color: colors.text.tertiary }}
                        />
                      )}
                    </div>

                    <div
                      className="flex items-center text-xs"
                      style={{
                        gap: spacing[4],
                        color: colors.text.secondary,
                      }}
                    >
                      <span
                        className="flex items-center"
                        style={{ gap: spacing[2] }}
                      >
                        <Clock className="h-3 w-3" />
                        {lesson.duration}
                      </span>

                      {isCurrent && (
                        <span
                          className="rounded-full font-medium"
                          style={{
                            backgroundColor: `${colors.brand.primary}1A`,
                            color: colors.brand.primary,
                            padding: `${spacing[1]} ${spacing[3]}`,
                          }}
                        >
                          الحالي
                        </span>
                      )}

                      {isPreview && (
                        <span
                          className="rounded-full font-medium"
                          style={{
                            backgroundColor: `${colors.brand.primary}1A`,
                            color: colors.brand.primary,
                            padding: `${spacing[1]} ${spacing[3]}`,
                          }}
                        >
                          معاينة
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Indicator */}
                {!isLocked && (
                  <motion.div
                    whileHover={{ x: -5 }}
                    className="transition-colors"
                    style={{ color: colors.text.tertiary }}
                  >
                    <PlayCircle className="h-5 w-5" />
                  </motion.div>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Enrollment CTA */}
      {!isEnrolled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center rounded-2xl"
          style={{
            padding: spacing[6],
            background: `linear-gradient(to right, ${colors.brand.primary}0D, ${colors.brand.secondary}0D)`,
            border: `1px solid ${colors.brand.primary}33`,
          }}
        >
          <p
            className="mb-3"
            style={{ color: colors.text.secondary }}
          >
            سجل في الدورة للوصول إلى جميع الدروس والميزات
          </p>
          <button
            className="font-semibold text-sm hover:underline"
            style={{ color: colors.brand.primary }}
          >
            اشترك الآن للوصول الكامل
          </button>
        </motion.div>
      )}
    </div>
  );
}
