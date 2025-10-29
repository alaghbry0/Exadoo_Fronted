/**
 * SubscribedView Component
 * واجهة المستخدم المشترك - عرض المشاريع المتاحة
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { LottieAnimation } from "@/shared/components/common/LottieAnimation";
import { ProjectCard } from "./ProjectCard";
import { animations } from "@/styles/animations";
import { colors, lineHeight, spacing, fontFamily } from "@/styles/tokens";
import type { MyForexSubscription } from "@/pages/api/forex";
import forexAnimation from "@/animations/utility.json";

interface SubscribedViewProps {
  sub: MyForexSubscription;
}

export const SubscribedView: React.FC<SubscribedViewProps> = ({ sub }) => {
  // قائمة المشاريع المتاحة
  const projects = useMemo(
    () => [
      {
        id: "1",
        title: "Exa-TradingPad",
        description:
          "Exa-TradingPad هو مكوّن أساسي لتنفيذ أوامر التداول في Overcharts. من خلال لوحة التداول يمكنك ضبط جميع إعدادات الأمر قبل تنفيذه.",
        icon: "/forex_s3.png",
        downloadLink: sub.download_link || "#",
        setupGuideLink: sub.setup_guide_link || "#",
      },
      // يمكن إضافة المزيد من المشاريع هنا
    ],
    [sub],
  );

  return (
      <main
        className="min-h-screen pb-24"
        style={{ backgroundColor: colors.bg.primary }}
      >
      <div className="max-w-6xl mx-auto px-4">
        {/* Lottie Animation */}
        <motion.div
          {...animations.fadeInUp}
          className="flex justify-center"
          
          
        >
          <LottieAnimation
            animationData={forexAnimation}
            width="80%"
            height={350}
            className="max-w-md"
            frameStyle={{
              backgroundColor: colors.bg.primary,
            }}
          />
        </motion.div>

        {/* Header */}
        <motion.div
          {...animations.fadeInUp}
          className="text-center mb-4"
        >
          <h1
            className="text-3xl md:text-12xl font-extrabold"
            style={{
              position: "relative",
              bottom: spacing[8],
              fontFamily: fontFamily.arabic,
            }}
          >
            مشاريعنا الخاصة بأدوات الفوركس!
          </h1>
          <p
            className="text-base md:text-lg max-w-2xl mx-auto"
            style={{
              color: colors.text.secondary,
              fontFamily: fontFamily.arabic,
              lineHeight: lineHeight.snug,
            }}
          >
            اختر من بين مجموعة متنوعة من المشاريع التي تقدمها Exaado!
          </p>
        </motion.div>

        {/* Projects List */}
        <div className="space-y-4">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} {...project} index={index} />
          ))}
        </div>
      </div>
    </main>
  );
};
