// src/pages/academy/bundle/components/BundleFeaturesSidebar.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Gift, Layers, MessageSquare, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { colors, spacing } from "@/styles/tokens";

interface Bundle {
  free_sessions_count?: string;
  telegram_url?: string;
}

interface BundleFeaturesSidebarProps {
  bundle: Bundle;
  coursesCount: number;
}

const FeatureItem: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}> = ({ icon, iconBg, iconColor, title, description }) => (
  <li className="flex items-start" style={{ gap: spacing[4] }}>
    <div
      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
      style={{ backgroundColor: iconBg }}
    >
      <div style={{ color: iconColor }}>{icon}</div>
    </div>
    <div>
      <p className="font-semibold" style={{ color: colors.text.primary }}>
        {title}
      </p>
      <p className="text-sm" style={{ color: colors.text.secondary }}>
        {description}
      </p>
    </div>
  </li>
);

export const BundleFeaturesSidebar: React.FC<BundleFeaturesSidebarProps> = ({
  bundle,
  coursesCount,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card
        className="overflow-hidden rounded-3xl border-0 shadow-lg"
        style={{ backgroundColor: colors.bg.elevated }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${colors.status.warning}15 0%, ${colors.status.warning}08 50%, ${colors.bg.elevated} 100%)`,
            padding: spacing[6],
          }}
        >
          <div
            className="mb-6 flex items-center"
            style={{ gap: spacing[4] }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: colors.status.warning }}
            >
              <Gift className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold" style={{ color: colors.text.primary }}>
              مميزات الحزمة
            </h3>
          </div>

          <ul className="space-y-4">
            <FeatureItem
              icon={<Layers className="h-5 w-5" />}
              iconBg={`${colors.brand.primary}1A`}
              iconColor={colors.brand.primary}
              title={`${coursesCount} دورات تدريبية`}
              description="محتوى شامل ومتكامل"
            />

            {parseInt(bundle.free_sessions_count || "0") > 0 && (
              <FeatureItem
                icon={<Gift className="h-5 w-5" />}
                iconBg={`${colors.status.success}1A`}
                iconColor={colors.status.success}
                title={`${bundle.free_sessions_count} جلسات خاصة`}
                description="مع المدرب مباشرة"
              />
            )}

            {bundle.telegram_url?.trim() && (
              <FeatureItem
                icon={<MessageSquare className="h-5 w-5" />}
                iconBg={`${colors.brand.primary}1A`}
                iconColor={colors.brand.primary}
                title="مجموعة تيليجرام"
                description="دعم مستمر ومتابعة"
              />
            )}

            <FeatureItem
              icon={<Award className="h-5 w-5" />}
              iconBg={`${colors.brand.secondary}1A`}
              iconColor={colors.brand.secondary}
              title="شهادة إتمام"
              description="بعد إكمال الحزمة"
            />
          </ul>
        </div>
      </Card>
    </motion.div>
  );
};

export default BundleFeaturesSidebar;
