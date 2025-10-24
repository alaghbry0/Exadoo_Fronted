// src/pages/academy/bundle/components/BundleHero.tsx
"use client";

import React from "react";
import { motion, useTransform, MotionValue } from "framer-motion";
import SmartImage from "@/shared/components/common/SmartImage";
import { colors } from "@/styles/tokens";

interface BundleHeroProps {
  coverImage?: string;
  title: string;
  y: MotionValue<number>;
  scale: MotionValue<number>;
}

export const BundleHero: React.FC<BundleHeroProps> = ({
  coverImage,
  title,
  y,
  scale,
}) => {
  return (
    <section
      className="relative h-[50vh] min-h-[320px] overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${colors.brand.primary}15 0%, ${colors.brand.secondary}10 100%)`,
      }}
    >
      <motion.div
        style={{ y, scale }}
        className="absolute inset-0"
      >
        <SmartImage
          src={coverImage || "/image.jpg"}
          alt={title}
          fill
          blurType="primary"
          sizes="100vw"
          className="object-cover"
          priority
        />
      </motion.div>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, transparent 0%, ${colors.bg.primary}E6 85%, ${colors.bg.primary} 100%)`,
        }}
      />
    </section>
  );
};

export default BundleHero;
