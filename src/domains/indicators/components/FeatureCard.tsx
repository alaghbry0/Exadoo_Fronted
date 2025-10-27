/**
 * FeatureCard Component
 * بطاقة عرض ميزة واحدة
 */

import { motion } from "framer-motion";
import { cn } from "@/shared/utils";
import { componentVariants } from "@/shared/components/ui/variants";
import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
      className={cn(
        componentVariants.card.elevated,
        "flex flex-col items-center text-center p-6 transition-all hover:-translate-y-1",
      )}
    >
      <div 
        className="p-4 rounded-2xl mb-4"
        style={{
          backgroundColor: "var(--color-primary-50)",
          color: "var(--color-primary-500)",
        }}
      >
        <Icon className="w-8 h-8" />
      </div>
      
      <h3 
        className="text-xl font-bold"
        style={{ color: "var(--color-text-primary)" }}
      >
        {title}
      </h3>
      
      <p 
        className="mt-1 flex-grow"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {description}
      </p>
    </motion.div>
  );
};
