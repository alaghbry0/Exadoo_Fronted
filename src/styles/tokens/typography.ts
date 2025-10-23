/**
 * Design Tokens - نظام الطباعة الموحد
 * يوفر أحجام وأوزان خطوط متسقة
 */

export const typography = {
  // Display - للعناوين الكبيرة جداً
  display: {
    xl: "text-6xl font-bold leading-tight tracking-tight",
    lg: "text-5xl font-bold leading-tight tracking-tight",
    md: "text-4xl font-bold leading-tight tracking-tight",
    sm: "text-3xl font-bold leading-tight",
  },

  // Heading - للعناوين
  heading: {
    xl: "text-2xl font-bold leading-snug",
    lg: "text-xl font-bold leading-snug",
    md: "text-lg font-semibold leading-snug",
    sm: "text-base font-semibold leading-snug",
    xs: "text-sm font-semibold leading-snug",
  },

  // Body - للنصوص العادية
  body: {
    xl: "text-xl leading-relaxed",
    lg: "text-lg leading-relaxed",
    md: "text-base leading-relaxed",
    sm: "text-sm leading-normal",
    xs: "text-xs leading-normal",
  },

  // Label - للتسميات والأزرار
  label: {
    lg: "text-sm font-medium leading-none",
    md: "text-xs font-medium leading-none",
    sm: "text-xs font-normal leading-none",
  },

  // Caption - للنصوص الصغيرة
  caption: {
    md: "text-xs leading-tight",
    sm: "text-[0.625rem] leading-tight",
  },
} as const;

// Font weights
export const fontWeight = {
  light: "300",
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
} as const;

// Line heights
export const lineHeight = {
  none: "1",
  tight: "1.25",
  snug: "1.375",
  normal: "1.5",
  relaxed: "1.625",
  loose: "2",
} as const;
