"use client";
import { motion } from "framer-motion";

import { colors, withAlpha } from "@/styles/tokens";
import { cn } from "@/shared/utils";

type AuroraBackgroundProps = {
  backgroundColor?: string;
  primaryBlobColor?: string;
  secondaryBlobColor?: string;
  highlightBlobColor?: string;
};

const defaultBlobPalette = {
  primary: withAlpha(colors.brand.primary, 0.32),
  secondary: withAlpha(colors.brand.primaryHover, 0.26),
  highlight: withAlpha(colors.brand.secondary, 0.24),
};

const AuroraBackground = ({
  backgroundColor = colors.bg.primary,
  primaryBlobColor = defaultBlobPalette.primary,
  secondaryBlobColor = defaultBlobPalette.secondary,
  highlightBlobColor = defaultBlobPalette.highlight,
}: AuroraBackgroundProps) => {
  return (
    <div
      className="absolute inset-0 z-[-1] overflow-hidden"
      style={{ backgroundColor }}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        {/* Gradient Blob 1 (لون الشعار الأساسي) */}
        <motion.div
          className={cn(
            "absolute top-0 left-0 h-96 w-96 rounded-full",
            "mix-blend-screen blur-aurora-lg",
            "dark:mix-blend-lighten",
          )}
          style={{
            background: primaryBlobColor,
          }}
          animate={{
            x: ["-20%", "20%", "-20%"],
            y: ["-20%", "20%", "-20%"],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
        {/* Gradient Blob 2 (اللون الثانوي) */}
        <motion.div
          className={cn(
            "absolute bottom-0 right-0 h-96 w-96 rounded-full",
            "mix-blend-screen blur-aurora-lg",
            "dark:mix-blend-lighten",
          )}
          style={{
            background: secondaryBlobColor,
          }}
          animate={{
            x: ["20%", "-20%", "20%"],
            y: ["20%", "-20%", "20%"],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 5,
          }}
        />
        {/* Gradient Blob 3 (لون الوهج) */}
        <motion.div
          className={cn(
            "absolute bottom-1/4 left-1/4 h-80 w-80 rounded-full",
            "mix-blend-screen blur-aurora-md",
            "dark:mix-blend-lighten",
          )}
          style={{
            background: highlightBlobColor,
          }}
          animate={{
            x: ["10%", "-10%", "10%"],
            y: ["-10%", "10%", "-10%"],
            rotate: [0, 45, 0],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 10,
          }}
        />
      </motion.div>
    </div>
  );
};

export default AuroraBackground;
