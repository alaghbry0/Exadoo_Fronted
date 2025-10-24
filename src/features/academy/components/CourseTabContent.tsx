/**
 * Course Tab Content
 * محتوى تبويبات الدورة (Overview, Curriculum, Outcomes)
 */

import React from "react";
import { FileText, BookOpen, Award } from "lucide-react";
import { colors } from "@/styles/tokens";
import type { Course, TabId } from "@/types/academy";
import CurriculumList from "@/pages/academy/course/components/CurriculumList";
import RealCurriculum from "@/pages/academy/course/components/RealCurriculum";
import { normalizeDescription } from "@/lib/academy";

interface CourseTabContentProps {
  activeTab: TabId;
  course: Course;
  isEnrolled: boolean;
  courseId: string;
  details?: any;
}

const TabContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="rounded-3xl border p-6 md:p-8 animate-fade-in backdrop-blur-xl shadow-lg"
    style={{
      borderColor: colors.border.default,
      backgroundColor: `${colors.bg.primary}b3`, // 70% opacity
    }}
  >
    {children}
  </div>
);

const TabHeader: React.FC<{
  icon: React.ElementType;
  title: string;
  iconBg?: string;
}> = ({ icon: Icon, title, iconBg = colors.brand.primary }) => (
  <header className="flex items-center gap-3 mb-4">
    <div
      className="flex h-10 w-10 items-center justify-center rounded-xl"
      style={{ backgroundColor: iconBg }}
    >
      <Icon className="h-5 w-5 text-white" />
    </div>
    <h2 className="text-xl font-bold" style={{ color: colors.text.primary }}>
      {title}
    </h2>
  </header>
);

export const CourseTabContent: React.FC<CourseTabContentProps> = ({
  activeTab,
  course,
  isEnrolled,
  courseId,
  details,
}) => {
  const { generalInfo, lessons } = normalizeDescription(course?.description);

  if (activeTab === "overview") {
    return (
      <TabContainer>
        <TabHeader icon={FileText} title="الوصف" />
        <p
          className="whitespace-pre-line text-base leading-relaxed"
          style={{ color: colors.text.secondary }}
        >
          {generalInfo || "لا يوجد وصف متوفر حاليًا."}
        </p>
      </TabContainer>
    );
  }

  if (activeTab === "curriculum") {
    return (
      <TabContainer>
        <TabHeader icon={BookOpen} title="المنهج الدراسي" />
        {isEnrolled && details?.sections?.length ? (
          <RealCurriculum courseId={courseId} sections={details.sections as any} />
        ) : (
          <CurriculumList
            isEnrolled={isEnrolled}
            lessonsTitles={lessons}
            totalLessons={course.total_number_of_lessons}
            duration={course.duration}
          />
        )}
      </TabContainer>
    );
  }

  if (activeTab === "outcomes") {
    return (
      <TabContainer>
        <TabHeader icon={Award} title="النتائج" iconBg="#d97706" />
        {course.outcomes?.length ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {course.outcomes.map((o, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="inline-block w-5 h-5 mt-0.5 rounded-full bg-green-500/15 text-green-600 flex items-center justify-center">
                  ✓
                </span>
                <span
                  className="text-base"
                  style={{ color: colors.text.secondary }}
                >
                  {o}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: colors.text.secondary }}>
            لا توجد نتائج محددة متاحة حاليًا
          </p>
        )}
      </TabContainer>
    );
  }

  return null;
};
