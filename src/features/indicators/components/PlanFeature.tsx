/**
 * PlanFeature Component
 * عنصر ميزة واحدة في خطة الاشتراك
 */

import { CheckCircle2 } from "lucide-react";

interface PlanFeatureProps {
  children: React.ReactNode;
}

export const PlanFeature: React.FC<PlanFeatureProps> = ({ children }) => (
  <li className="flex items-start gap-3 text-right">
    <CheckCircle2 
      className="w-5 h-5 shrink-0 mt-0.5"
      style={{ color: "var(--color-success-500)" }}
    />
    <span style={{ color: "var(--color-text-secondary)" }}>{children}</span>
  </li>
);
