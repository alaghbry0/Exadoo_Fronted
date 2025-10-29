/**
 * Design Tokens - نظام الألوان الموحد
 * يوفر ألوان semantic واضحة مع دعم Dark Mode
 */

export const colors = {
  // Text colors
  text: {
    primary: "var(--color-text-primary)",
    secondary: "var(--color-text-secondary)",
    tertiary: "var(--color-text-tertiary)",
    disabled: "var(--color-text-disabled)",
    inverse: "var(--color-text-inverse)",
    link: "var(--color-text-link)",
    linkHover: "var(--color-text-link-hover)",
  },

  // Background colors
  bg: {
    primary: "var(--color-bg-primary)",
    secondary: "var(--color-bg-secondary)",
    tertiary: "var(--color-bg-tertiary)",
    elevated: "var(--color-bg-elevated)",
    gradientPrimary: "var(--color-bg-gradient-primary)",
    gradientElevated: "var(--color-bg-gradient-elevated)",
    overlay: "var(--color-bg-overlay)",
    inverse: "var(--color-bg-inverse)",
  },

  // Border colors
  border: {
    default: "var(--color-border-default)",
    hover: "var(--color-border-hover)",
    focus: "var(--color-border-focus)",
    disabled: "var(--color-border-disabled)",
    error: "var(--color-border-error)",
  },

  // Brand colors
  brand: {
    primary: "var(--color-primary-500)",
    primaryHover: "var(--color-primary-600)",
    primaryActive: "var(--color-primary-700)",
    secondary: "var(--color-secondary-500)",
    secondaryHover: "var(--color-secondary-600)",
  },

  // Status colors
  status: {
    success: "var(--color-success-500)",
    successBg: "var(--color-success-50)",
    warning: "var(--color-warning-500)",
    warningBg: "var(--color-warning-50)",
    error: "var(--color-error-500)",
    errorBg: "var(--color-error-50)",
    info: "var(--color-primary-500)",
    infoBg: "var(--color-primary-50)",
  },
} as const;

// CSS Variables للاستخدام المباشر
export const colorVars = `
  /* Light Mode - WCAG AA Compliant */
  :root {
    /* Text - محسّن لـ WCAG (contrast ratio > 4.5:1) */
    --color-text-primary: #0a0a0a;           /* #1a1a1a → #0a0a0a (darker) */
    --color-text-secondary: #525252;         /* #6b7280 → #525252 (darker) ✅ */
    --color-text-tertiary: #737373;          /* #9ca3af → #737373 (darker) */
    --color-text-disabled: #a3a3a3;          /* #d1d5db → #a3a3a3 */
    --color-text-inverse: #fafafa;
    --color-text-link: #0066CC;              /* darker for better contrast */
    --color-text-link-hover: #0052A3;

    /* Background */
    --color-bg-primary: #ffffff;
    --color-bg-secondary: #f9fafb;
    --color-bg-tertiary: #f3f4f6;
    --color-bg-elevated: #ffffff;
    --color-bg-overlay: rgba(0, 0, 0, 0.5);
    --color-bg-inverse: #1a1a1a;
    --color-bg-gradient-primary: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
    --color-bg-gradient-elevated: linear-gradient(180deg, #ffffff 0%, #f3f4f6 100%);

    /* Border */
    --color-border-default: #e5e7eb;
    --color-border-hover: #d1d5db;
    --color-border-focus: #0084FF;
    --color-border-disabled: #f3f4f6;
    --color-border-error: #ef4444;
  }

  /* Dark Mode */
  .dark {
    /* Text */
    --color-text-primary: #f8fafc;
    --color-text-secondary: #d7e2f0; /* maintains 6.9:1 contrast on #1f2937 */
    --color-text-tertiary: #aebad0;
    --color-text-disabled: #556070;
    --color-text-inverse: #1a1a1a;
    --color-text-link: #60a5fa;
    --color-text-link-hover: #93c5fd;

    /* Background */
    --color-bg-primary: #111827;
    --color-bg-secondary: #1f2937;
    --color-bg-tertiary: #273445;
    --color-bg-elevated: #1c2534;
    --color-bg-overlay: rgba(0, 0, 0, 0.7);
    --color-bg-inverse: #ffffff;
    --color-bg-gradient-primary: linear-gradient(180deg, #111827 0%, #1f2937 100%);
    --color-bg-gradient-elevated: linear-gradient(180deg, #1c2534 0%, #273445 100%);

    /* Border */
    --color-border-default: #2a3648;
    --color-border-hover: #3a455a;
    --color-border-focus: #60a5fa;
    --color-border-disabled: #1a2331;
    --color-border-error: #f87171;
  }
`;
