/**
 * SubscribedView Component
 * واجهة المستخدم المشترك - عرض المشاريع المتاحة
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { LottieAnimation } from "./LottieAnimation";
import { ProjectCard } from "./ProjectCard";
import { forexAnimations } from "../animations";
import type { MyForexSubscription } from "@/pages/api/forex";
import forexAnimation from "@/animations/forex_1.json";

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
          "Exa-TradingPad is a fundamental component for placing orders in Overcharts. Using Trading Panel you can set all parameters of the order being placed",
        icon: "/logo.png",
        downloadLink: sub.download_link || "#",
        setupGuideLink: sub.setup_guide_link || "#",
      },
      // يمكن إضافة المزيد من المشاريع هنا
    ],
    [sub],
  );

  return (
    <main
      className="min-h-screen pb-24 pt-8"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <div className="max-w-4xl mx-auto px-4">
        {/* Lottie Animation */}
        <motion.div
          {...forexAnimations.fadeInUp}
          className="flex justify-center mb-8"
        >
          <LottieAnimation
            animationData={forexAnimation}
            width="100%"
            height={350}
            className="max-w-md"
          />
        </motion.div>

        {/* Header */}
        <motion.div
          {...forexAnimations.fadeInUp}
          className="text-center mb-12"
        >
          <h1
            className="text-3xl md:text-4xl font-extrabold mb-3"
            style={{
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-arabic)",
            }}
          >
            Our Forex Utility Projects !
          </h1>
          <p
            className="text-base md:text-lg max-w-2xl mx-auto"
            style={{
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-arabic)",
            }}
          >
            Choose between a variety of projects provided by Exaado!
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
