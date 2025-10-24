/**
 * Section Header Component
 * رأس قسم مع أيقونة وعداد
 */

import React from "react";
import { LucideIcon } from "lucide-react";
import { colors } from "@/styles/tokens";

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  count: number;
  id: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon: Icon,
  title,
  count,
  id,
}) => (
  <div className="mb-5 flex items-center justify-between">
    <div className="flex items-center gap-2.5">
      <div
        className="rounded-xl p-2 shadow-sm"
        style={{
          background: `linear-gradient(to bottom right, ${colors.brand.primary}, ${colors.brand.primaryHover})`,
        }}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h2
        id={id}
        className="text-[22px] font-bold"
        style={{ color: colors.text.primary }}
      >
        {title}
      </h2>
    </div>
    <span
      className="rounded-full px-3 py-1 text-sm font-bold bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
    >
      {count}
    </span>
  </div>
);
