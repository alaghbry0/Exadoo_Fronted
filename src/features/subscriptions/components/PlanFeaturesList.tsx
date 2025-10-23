// PlanFeaturesList.tsx
"use client";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface PlanFeaturesListProps {
  features?: string[];
}

const listItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export const PlanFeaturesList = ({ features }: PlanFeaturesListProps) => (
  <div className="space-y-4">
    <ul className="space-y-3">
      {features?.map((feature, index) => (
        <motion.li
          key={index}
          variants={listItemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: index * 0.1 }}
          className="flex items-start gap-5 p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <CheckCircle className="text-blue-500 mt-1 flex-shrink-0" />
          <span className="text-gray-700 text-sm leading-relaxed">
            {feature}
          </span>
        </motion.li>
      ))}
    </ul>
  </div>
);
