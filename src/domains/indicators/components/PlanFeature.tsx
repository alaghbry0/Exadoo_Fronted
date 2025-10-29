/**
 * PlanFeature Component
 * عنصر ميزة واحدة في خطة الاشتراك
 */

import { CheckCircle2 } from "lucide-react";
import { colors } from "@/styles/tokens";

interface PlanFeatureProps {
  children: React.ReactNode;
}

export const PlanFeature: React.FC<PlanFeatureProps> = ({ children }) => (
    <li className="flex items-start gap-3 text-right">
      <CheckCircle2
        className="w-5 h-5 shrink-0 mt-0.5"
        style={{ color: colors.status.success }}
      />
      <span style={{ color: colors.text.secondary }}>{children}</span>
  </li>
);
