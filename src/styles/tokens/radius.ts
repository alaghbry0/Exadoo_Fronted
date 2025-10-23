/**
 * Design Tokens - نظام Border Radius الموحد
 * يوفر أحجام موحدة للزوايا المستديرة
 */

export const radius = {
  // Base radius
  none: "0",
  xs: "0.125rem", // 2px
  sm: "0.25rem", // 4px
  md: "0.5rem", // 8px
  lg: "0.75rem", // 12px
  xl: "1rem", // 16px
  "2xl": "1.25rem", // 20px
  "3xl": "1.5rem", // 24px
  "4xl": "2rem", // 32px
  full: "9999px", // دائري كامل
} as const;

// Semantic radius للمكونات
export const componentRadius = {
  button: "rounded-xl", // 16px
  card: "rounded-2xl", // 20px
  modal: "rounded-3xl", // 24px
  input: "rounded-lg", // 12px
  badge: "rounded-full", // دائري
  avatar: "rounded-full", // دائري
  chip: "rounded-full", // دائري
  image: "rounded-xl", // 16px
  dialog: "rounded-3xl", // 24px
  dropdown: "rounded-2xl", // 20px
  tooltip: "rounded-lg", // 12px
  tab: "rounded-xl", // 16px
} as const;
