/**
 * Design Tokens - نظام المسافات الموحد
 * مبني على 8-point grid system
 */

export const spacing = {
  // Base spacing (8px grid)
  0: "0",
  1: "0.125rem", // 2px
  2: "0.25rem", // 4px
  3: "0.5rem", // 8px
  4: "0.75rem", // 12px
  5: "1rem", // 16px
  6: "1.5rem", // 24px
  7: "1.25rem", // 20px (للتباعدات الثابتة كأزرار FAB)
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  32: "8rem", // 128px
  40: "10rem", // 160px
  48: "12rem", // 192px
  56: "14rem", // 224px
  64: "16rem", // 256px
} as const;

// Semantic spacing للاستخدام المباشر
export const semanticSpacing = {
  // Component spacing
  component: {
    xs: spacing[2], // 4px
    sm: spacing[3], // 8px
    md: spacing[4], // 12px
    lg: spacing[5], // 16px
    xl: spacing[6], // 24px
  },

  // Layout spacing
  layout: {
    xs: spacing[4], // 12px
    sm: spacing[5], // 16px
    md: spacing[6], // 24px
    lg: spacing[8], // 32px
    xl: spacing[12], // 48px
    "2xl": spacing[16], // 64px
  },

  // Section spacing
  section: {
    sm: spacing[8], // 32px
    md: spacing[12], // 48px
    lg: spacing[16], // 64px
    xl: spacing[20], // 80px
    "2xl": spacing[24], // 96px
  },

  // Fixed placements & safe areas
  fixed: {
    fabOffset: `calc(env(safe-area-inset-bottom, 0px) + ${spacing[7]})`,
    safeAreaTop: "env(safe-area-inset-top, 0px)",
  },
} as const;
