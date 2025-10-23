import React from "react";
import { CheckCircle2, Lock, PlayCircle, Clock, Video } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
      <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-neutral-800/50 rounded-2xl">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {totalLessons} درس
          </span>
          <span className="text-gray-600 dark:text-gray-400">•</span>
          <span className="text-gray-600 dark:text-gray-400">
            {duration || "--:--"}
          </span>
        </div>
        {!isEnrolled && (
          <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-1 rounded-full">
            المعاينة محدودة
          </span>
        )}
      </div>

      {/* Lessons List */}
      <div className="border border-gray-200 dark:border-neutral-700 rounded-2xl overflow-hidden bg-white/50 dark:bg-neutral-800/30 backdrop-blur-sm">
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
              className={cn(
                "border-b border-gray-100 dark:border-neutral-700 last:border-b-0 group",
                isLocked
                  ? "bg-gray-50/50 dark:bg-neutral-900/30"
                  : "hover:bg-gray-50 dark:hover:bg-neutral-700/30",
              )}
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
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300",
                      isLocked
                        ? "bg-gray-200 dark:bg-neutral-700 text-gray-400"
                        : isCompleted
                          ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                          : isPreview
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            : "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Lesson Info */}
                  <div className="min-w-0 flex-1 text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "font-medium truncate",
                          isLocked
                            ? "text-gray-500"
                            : "text-gray-900 dark:text-white",
                        )}
                      >
                        {lesson.title}
                      </span>
                      {lesson.type === "video" && (
                        <Video className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {lesson.duration}
                      </span>

                      {isCurrent && (
                        <span className="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 px-2 py-0.5 rounded-full font-medium">
                          الحالي
                        </span>
                      )}

                      {isPreview && (
                        <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
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
                    className="text-gray-400 group-hover:text-primary-500 transition-colors"
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
          className="text-center p-6 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-2xl border border-primary-200 dark:border-primary-800"
        >
          <p className="text-gray-600 dark:text-gray-300 mb-3">
            سجل في الدورة للوصول إلى جميع الدروس والميزات
          </p>
          <button className="text-primary-600 dark:text-primary-400 font-semibold text-sm hover:underline">
            اشترك الآن للوصول الكامل
          </button>
        </motion.div>
      )}
    </div>
  );
}
