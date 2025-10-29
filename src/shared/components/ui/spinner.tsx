import { motion } from "framer-motion";
import type { CSSProperties } from "react";

import { cn } from "@/shared/utils";
import { colors, spacing } from "@/styles/tokens";

export interface SpinnerProps {
  className?: string;
  style?: CSSProperties;
  label?: string;
}

export function Spinner({ className, style, label = "جاري التحميل" }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn("flex items-center justify-center", className)}
    >
      <motion.svg
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
        style={{
          width: spacing[8],
          height: spacing[8],
          color: colors.brand.primary,
          ...style,
        }}
        viewBox="0 0 50 50"
        focusable="false"
        aria-hidden
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          stroke="currentColor"
          strokeWidth="5"
          fill="none"
          opacity={0.25}
        />
        <path
          fill="currentColor"
          d="M25 5C13.507 5 5 13.507 5 25h5c0-10.493 8.507-19 19-19V5z"
          opacity={0.75}
        />
      </motion.svg>
    </div>
  );
}
