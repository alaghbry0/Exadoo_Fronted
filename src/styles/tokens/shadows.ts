/**
 * Design Tokens - نظام الظلال الموحد
 * يوفر ظلال متدرجة مع دعم Dark Mode
 */

export const shadows = {
  // Elevation shadows - للارتفاع
  elevation: {
    0: "none",
    1: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    2: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    3: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    4: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    5: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    6: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },

  // Colored shadows - ظلال ملونة
  colored: {
    primary: {
      sm: "0 4px 14px 0 rgba(0, 132, 255, 0.15)",
      md: "0 8px 25px 0 rgba(0, 132, 255, 0.2)",
      lg: "0 20px 40px -12px rgba(0, 132, 255, 0.25)",
    },
    secondary: {
      sm: "0 4px 14px 0 rgba(139, 92, 246, 0.15)",
      md: "0 8px 25px 0 rgba(139, 92, 246, 0.2)",
      lg: "0 20px 40px -12px rgba(139, 92, 246, 0.25)",
    },
    success: {
      sm: "0 4px 14px 0 rgba(16, 185, 129, 0.15)",
      md: "0 8px 25px 0 rgba(16, 185, 129, 0.2)",
    },
    error: {
      sm: "0 4px 14px 0 rgba(239, 68, 68, 0.15)",
      md: "0 8px 25px 0 rgba(239, 68, 68, 0.2)",
    },
  },

  // Glow effects - تأثيرات الوهج
  glow: {
    sm: "0 0 20px rgba(0, 132, 255, 0.2)",
    md: "0 0 40px rgba(0, 132, 255, 0.3)",
    lg: "0 0 60px rgba(0, 132, 255, 0.4)",
    purple: "0 0 40px rgba(139, 92, 246, 0.3)",
  },

  // Inner shadows
  inner: {
    sm: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
    md: "inset 0 2px 8px 0 rgba(0, 0, 0, 0.1)",
  },
} as const;

// CSS classes للاستخدام المباشر - موحدة
export const shadowClasses = {
  // Cards - البطاقات
  card: "shadow-md hover:shadow-lg transition-shadow duration-300",
  cardHover: "shadow-lg hover:shadow-xl transition-shadow duration-300",
  cardElevated: "shadow-xl",
  cardInteractive: "shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5",
  
  // Modals & Overlays
  modal: "shadow-2xl",
  dialog: "shadow-2xl",
  
  // Dropdowns & Popovers
  dropdown: "shadow-lg",
  popover: "shadow-lg",
  tooltip: "shadow-md",
  
  // Buttons
  button: "shadow-sm hover:shadow-md active:shadow-sm transition-shadow duration-200",
  buttonElevated: "shadow-md hover:shadow-lg active:shadow-md transition-shadow duration-200",
  
  // Inputs & Forms
  input: "shadow-sm focus:shadow-md transition-shadow duration-200",
  
  // Special effects
  glow: "shadow-[0_0_40px_rgba(0,132,255,0.3)]",
  glowPurple: "shadow-[0_0_40px_rgba(139,92,246,0.3)]",
  
  // None
  none: "shadow-none",
} as const;

// Shadow utility للاستخدام الديناميكي
export type ShadowType = keyof typeof shadowClasses;
