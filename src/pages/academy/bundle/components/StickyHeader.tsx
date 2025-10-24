// src/pages/academy/bundle/components/StickyHeader.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { colors, spacing } from "@/styles/tokens";

interface StickyHeaderProps {
  title: string;
  price?: string;
  visible: boolean;
  onCTA: () => void;
}

const formatPrice = (value?: string) => {
  if (!value) return "";
  if (value.toLowerCase?.() === "free") return "مجاني";
  const n = Number(value);
  return isNaN(n) ? value : `$${n.toFixed(0)}`;
};

export const StickyHeader: React.FC<StickyHeaderProps> = ({
  title,
  price,
  visible,
  onCTA,
}) => {
  const buttonText =
    price?.toLowerCase?.() === "free" || Number(price) === 0
      ? "ابدأ الآن"
      : `اشترك - ${formatPrice(price)}`;

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: visible ? 0 : -100 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md shadow-md"
      style={{
        backgroundColor: `${colors.bg.elevated}F0`,
      }}
    >
      <div
        className="container mx-auto flex justify-between items-center"
        style={{ padding: `${spacing[4]} ${spacing[5]}` }}
      >
        <h2
          className="min-w-0 font-bold text-sm sm:text-base truncate"
          style={{ color: colors.text.primary }}
        >
          {title}
        </h2>
        <button
          onClick={onCTA}
          className="hidden sm:flex items-center justify-center rounded-md text-sm font-bold transition-colors"
          style={{
            backgroundColor: colors.brand.primary,
            color: colors.text.inverse,
            padding: `${spacing[3]} ${spacing[5]}`,
            gap: spacing[2],
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.brand.primaryHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.brand.primary;
          }}
        >
          <ShoppingCart className="h-5 w-5" />
          <span>{buttonText}</span>
        </button>
      </div>
    </motion.div>
  );
};

export default StickyHeader;
