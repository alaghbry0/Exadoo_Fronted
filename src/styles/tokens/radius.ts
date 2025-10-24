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

// Semantic radius للمكونات - موحد بـ rounded-xl (16px)
export const componentRadius = {
  // Primary Components - rounded-xl (16px) بشكل موحد
  button: "rounded-xl",
  card: "rounded-xl",      // ✅ موحد!
  modal: "rounded-xl",
  input: "rounded-xl",     // ✅ محدث من lg
  dialog: "rounded-xl",
  image: "rounded-xl",
  tab: "rounded-xl",
  dropdown: "rounded-xl",  // ✅ محدث من 2xl
  
  // Small Components - rounded-lg (12px)
  tooltip: "rounded-lg",
  
  // Circular Components - rounded-full
  badge: "rounded-full",
  avatar: "rounded-full",
  chip: "rounded-full",
} as const;

// Radius Classes - للاستخدام المباشر
export const radiusClasses = {
  default: "rounded-xl",    // 16px - الافتراضي
  sm: "rounded-lg",         // 12px
  md: "rounded-xl",         // 16px
  lg: "rounded-2xl",        // 20px
  full: "rounded-full",     // دائري
  none: "rounded-none",
} as const;
