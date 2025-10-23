/**
 * Design Tokens - نظام الظلال الموحد
 * يوفر ظلال متدرجة مع دعم Dark Mode
 */

export const shadows = {
  // Elevation shadows - للارتفاع
  elevation: {
    0: 'none',
    1: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    2: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    3: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    4: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    5: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    6: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },

  // Colored shadows - ظلال ملونة
  colored: {
    primary: {
      sm: '0 4px 14px 0 rgba(0, 132, 255, 0.15)',
      md: '0 8px 25px 0 rgba(0, 132, 255, 0.2)',
      lg: '0 20px 40px -12px rgba(0, 132, 255, 0.25)',
    },
    secondary: {
      sm: '0 4px 14px 0 rgba(139, 92, 246, 0.15)',
      md: '0 8px 25px 0 rgba(139, 92, 246, 0.2)',
      lg: '0 20px 40px -12px rgba(139, 92, 246, 0.25)',
    },
    success: {
      sm: '0 4px 14px 0 rgba(16, 185, 129, 0.15)',
      md: '0 8px 25px 0 rgba(16, 185, 129, 0.2)',
    },
    error: {
      sm: '0 4px 14px 0 rgba(239, 68, 68, 0.15)',
      md: '0 8px 25px 0 rgba(239, 68, 68, 0.2)',
    },
  },

  // Glow effects - تأثيرات الوهج
  glow: {
    sm: '0 0 20px rgba(0, 132, 255, 0.2)',
    md: '0 0 40px rgba(0, 132, 255, 0.3)',
    lg: '0 0 60px rgba(0, 132, 255, 0.4)',
    purple: '0 0 40px rgba(139, 92, 246, 0.3)',
  },

  // Inner shadows
  inner: {
    sm: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    md: 'inset 0 2px 8px 0 rgba(0, 0, 0, 0.1)',
  },
} as const;

// CSS classes للاستخدام المباشر
export const shadowClasses = {
  card: 'shadow-elevation-2 hover:shadow-elevation-4 transition-shadow duration-300',
  cardInteractive: 'shadow-elevation-2 hover:shadow-elevation-5 transition-shadow duration-300',
  button: 'shadow-elevation-1 hover:shadow-elevation-3 active:shadow-elevation-1',
  modal: 'shadow-elevation-6',
  dropdown: 'shadow-elevation-4',
} as const;
