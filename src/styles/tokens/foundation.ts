export type ColorMode = "light" | "dark";

export type ColorVariableConfig = Record<string, Record<ColorMode, string>>;

export const colorVariables: ColorVariableConfig = {
  "--color-text-primary": { light: "#0a0a0a", dark: "#f8fafc" },
  "--color-text-secondary": { light: "#525252", dark: "#d7e2f0" },
  "--color-text-tertiary": { light: "#737373", dark: "#aebad0" },
  "--color-text-disabled": { light: "#a3a3a3", dark: "#556070" },
  "--color-text-inverse": { light: "#fafafa", dark: "#1a1a1a" },
  "--color-text-link": { light: "#0066cc", dark: "#60a5fa" },
  "--color-text-link-hover": { light: "#0052a3", dark: "#93c5fd" },

  "--color-bg-primary": { light: "#ffffff", dark: "#161f2e" },
  "--color-bg-secondary": { light: "#f9fafb", dark: "#1f2a3a" },
  "--color-bg-tertiary": { light: "#f3f4f6", dark: "#263347" },
  "--color-bg-elevated": { light: "#ffffff", dark: "#1c293a" },
  "--color-bg-overlay": { light: "rgba(0, 0, 0, 0.5)", dark: "rgba(0, 0, 0, 0.7)" },
  "--color-bg-inverse": { light: "#1a1a1a", dark: "#ffffff" },
  "--color-bg-gradient-primary": {
    light: "linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)",
    dark: "linear-gradient(180deg, #161f2e 0%, #1f2a3a 100%)",
  },
  "--color-bg-gradient-elevated": {
    light: "linear-gradient(180deg, #ffffff 0%, #f3f4f6 100%)",
    dark: "linear-gradient(180deg, #1c293a 0%, #263347 100%)",
  },

  "--color-border-default": { light: "#e5e7eb", dark: "#253247" },
  "--color-border-hover": { light: "#d1d5db", dark: "#31415a" },
  "--color-border-focus": { light: "#0084ff", dark: "#60a5fa" },
  "--color-border-disabled": { light: "#f3f4f6", dark: "#1b2434" },
  "--color-border-error": { light: "#ef4444", dark: "#f87171" },

  "--color-primary-50": { light: "#eff6ff", dark: "#eff6ff" },
  "--color-primary-100": { light: "#dbeafe", dark: "#dbeafe" },
  "--color-primary-200": { light: "#bfdbfe", dark: "#bfdbfe" },
  "--color-primary-300": { light: "#93c5fd", dark: "#93c5fd" },
  "--color-primary-400": { light: "#60a5fa", dark: "#60a5fa" },
  "--color-primary-500": { light: "#0084ff", dark: "#0084ff" },
  "--color-primary-600": { light: "#0066cc", dark: "#0066cc" },
  "--color-primary-700": { light: "#1d4ed8", dark: "#1d4ed8" },
  "--color-primary-800": { light: "#1e40af", dark: "#1e40af" },
  "--color-primary-900": { light: "#1e3a8a", dark: "#1e3a8a" },

  "--color-secondary-500": { light: "#8b5cf6", dark: "#8b5cf6" },
  "--color-secondary-600": { light: "#7c3aed", dark: "#7c3aed" },

  "--color-success-50": { light: "#ecfdf3", dark: "rgba(34, 197, 94, 0.12)" },
  "--color-success-500": { light: "#16a34a", dark: "#22c55e" },
  "--color-warning-50": { light: "#fffbeb", dark: "rgba(250, 204, 21, 0.12)" },
  "--color-warning-500": { light: "#f59e0b", dark: "#facc15" },
  "--color-error-50": { light: "#fef2f2", dark: "rgba(248, 113, 113, 0.14)" },
  "--color-error-500": { light: "#ef4444", dark: "#f87171" },
  "--color-info-50": { light: "#eff6ff", dark: "#1f2a3a" },
  "--color-info-500": { light: "#0084ff", dark: "#60a5fa" },
};

export const gradientTokens: Record<string, { light: string; dark?: string }> = {
  "--gradient-primary": {
    light: "linear-gradient(135deg, #0084ff 0%, #0066cc 100%)",
  },
  "--gradient-secondary": {
    light: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
  },
  "--gradient-success": {
    light: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  },
  "--gradient-warning": {
    light: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  },
  "--gradient-hero": {
    light:
      "linear-gradient(135deg, rgba(239, 246, 255, 0.8) 0%, rgba(219, 234, 254, 0.6) 35%, rgba(196, 181, 253, 0.4) 100%)",
    dark:
      "linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(30, 41, 59, 0.8) 35%, rgba(51, 65, 85, 0.7) 100%)",
  },
  "--gradient-glow-ring-primary": {
    light:
      "radial-gradient(160px 160px at 50% 12%, rgba(0, 132, 255, 0.18), rgba(0, 132, 255, 0))",
    dark:
      "radial-gradient(160px 160px at 50% 12%, rgba(59, 130, 246, 0.32), rgba(15, 23, 42, 0))",
  },
  "--gradient-glow-ring-neutral": {
    light:
      "radial-gradient(160px 160px at 50% 12%, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0))",
    dark:
      "radial-gradient(160px 160px at 50% 12%, rgba(148, 163, 184, 0.28), rgba(15, 23, 42, 0))",
  },
  "--gradient-surface-sheen": {
    light:
      "linear-gradient(120deg, rgba(15, 23, 42, 0.08), transparent 55%, rgba(15, 23, 42, 0.06))",
    dark:
      "linear-gradient(120deg, rgba(148, 163, 184, 0.16), transparent 55%, rgba(148, 163, 184, 0.12))",
  },
};

export const effectTokens: Record<string, { light: string; dark?: string }> = {
  "--border-glow-ring-primary": {
    light: "linear-gradient(135deg, rgba(14, 165, 233, 0.6), rgba(59, 130, 246, 0.45))",
    dark: "linear-gradient(135deg, rgba(56, 189, 248, 0.75), rgba(59, 130, 246, 0.55))",
  },
};

export const auroraTokens: Record<string, string> = {
  "--aurora-primary": "rgba(56, 189, 248, 0.22)",
  "--aurora-secondary": "rgba(14, 165, 233, 0.18)",
  "--aurora-highlight": "rgba(191, 219, 254, 0.2)",
  "--aurora-blur-lg": "100px",
  "--aurora-blur-md": "90px",
};

export const auroraDarkTokens: Record<string, string> = {
  "--aurora-primary": "rgba(37, 99, 235, 0.32)",
  "--aurora-secondary": "rgba(14, 165, 233, 0.28)",
  "--aurora-highlight": "rgba(148, 163, 184, 0.24)",
};

export const spacingScale = {
  0: "0",
  1: "0.125rem",
  2: "0.25rem",
  3: "0.5rem",
  4: "0.75rem",
  5: "1rem",
  6: "1.5rem",
  7: "1.25rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  32: "8rem",
  40: "10rem",
  48: "12rem",
  56: "14rem",
  64: "16rem",
} as const;

export const spacingVariables: Record<string, string> = Object.fromEntries(
  Object.entries(spacingScale).map(([key, value]) => [`--space-${key}`, value]),
);

export const semanticSpacingVariables: Record<string, string> = {
  "--space-fab-offset": "1.25rem",
};

export const radiusScale = {
  none: "0",
  xs: "0.125rem",
  sm: "0.25rem",
  base: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.25rem",
  "3xl": "1.5rem",
  "4xl": "2rem",
  full: "9999px",
} as const;

export const radiusVariables: Record<string, string> = Object.fromEntries(
  Object.entries(radiusScale).map(([key, value]) => [`--radius-${key}`, value]),
);

export const componentRadiusValues: Record<string, string> = {
  button: radiusScale.xl,
  card: radiusScale.xl,
  modal: radiusScale.xl,
  input: radiusScale.xl,
  dialog: radiusScale.xl,
  image: radiusScale.xl,
  tab: radiusScale.xl,
  dropdown: radiusScale.xl,
  tooltip: radiusScale.lg,
  badge: radiusScale.full,
  avatar: radiusScale.full,
  chip: radiusScale.full,
};

export const fontVariables: Record<string, string> = {
  "--font-arabic": "'Almarai', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji'",
  "--font-sans": "'Almarai', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans'",
  "--font-display": "'Almarai', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans'",
  "--font-mono": "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
};

export const typographyScale = {
  display: {
    xl: { fontSize: "3.75rem", lineHeight: 1.25, fontWeight: 700, letterSpacing: -0.02 },
    lg: { fontSize: "3rem", lineHeight: 1.2, fontWeight: 700, letterSpacing: -0.02 },
    md: { fontSize: "2.25rem", lineHeight: 1.2, fontWeight: 700, letterSpacing: -0.015 },
    sm: { fontSize: "1.875rem", lineHeight: 1.25, fontWeight: 700, letterSpacing: -0.01 },
  },
  heading: {
    xl: { fontSize: "1.5rem", lineHeight: 1.375, fontWeight: 700 },
    lg: { fontSize: "1.25rem", lineHeight: 1.375, fontWeight: 700 },
    md: { fontSize: "1.125rem", lineHeight: 1.375, fontWeight: 600 },
    sm: { fontSize: "1rem", lineHeight: 1.375, fontWeight: 600 },
    xs: { fontSize: "0.875rem", lineHeight: 1.375, fontWeight: 600 },
  },
  body: {
    xl: { fontSize: "1.25rem", lineHeight: 1.625, fontWeight: 400 },
    lg: { fontSize: "1.125rem", lineHeight: 1.625, fontWeight: 400 },
    md: { fontSize: "1rem", lineHeight: 1.625, fontWeight: 400 },
    sm: { fontSize: "0.875rem", lineHeight: 1.5, fontWeight: 400 },
    xs: { fontSize: "0.75rem", lineHeight: 1.4, fontWeight: 400 },
  },
  label: {
    lg: { fontSize: "0.875rem", lineHeight: 1.2, fontWeight: 500 },
    md: { fontSize: "0.75rem", lineHeight: 1.1, fontWeight: 500 },
    sm: { fontSize: "0.75rem", lineHeight: 1.1, fontWeight: 400 },
  },
  caption: {
    md: { fontSize: "0.75rem", lineHeight: 1.2, fontWeight: 400 },
    sm: { fontSize: "0.625rem", lineHeight: 1.2, fontWeight: 400 },
  },
} as const;

export const shadowElevation = {
  0: "none",
  1: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  2: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  3: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  4: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  5: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  6: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
} as const;

export const shadowColored = {
  primary: {
    sm: "0 4px 14px 0 rgba(0, 132, 255, 0.15)",
    md: "0 8px 25px 0 rgba(0, 132, 255, 0.2)",
    lg: "0 20px 40px -12px rgba(0, 132, 255, 0.25)",
    glow: "0 0 40px rgba(0, 132, 255, 0.3)",
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
} as const;

export const shadowInner = {
  sm: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  md: "inset 0 2px 8px 0 rgba(0, 0, 0, 0.1)",
} as const;

export const shadowComposite = {
  floatingFab: "0 18px 45px rgba(15, 23, 42, 0.18), 0 8px 22px rgba(37, 99, 235, 0.12)",
  surfaceGlow: "0 25px 65px rgba(15, 23, 42, 0.25), 0 18px 40px rgba(56, 189, 248, 0.15)",
  focusRing: "0 0 0 2px rgba(255, 255, 255, 0.3), 0 0 0 6px rgba(37, 99, 235, 0.35)",
} as const;

export const motionDurations = {
  instant: "0ms",
  fast: "150ms",
  normal: "300ms",
  slow: "500ms",
  slower: "700ms",
} as const;

export const motionEasing = {
  default: "cubic-bezier(0.4, 0, 0.2, 1)",
  linear: "linear",
  in: "cubic-bezier(0.4, 0, 1, 1)",
  out: "cubic-bezier(0, 0, 0.2, 1)",
  inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

export const reducedMotionStyles = `
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;

export const keyframeDefinitions = {
  "fade-in": `
    from { opacity: 0; }
    to { opacity: 1; }
  `,
  "fade-out": `
    from { opacity: 1; }
    to { opacity: 0; }
  `,
  "slide-up": `
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  `,
  "slide-down": `
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  `,
  "slide-left": `
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  `,
  "slide-right": `
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  `,
  "scale-in": `
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  `,
  "scale-out": `
    from { opacity: 1; transform: scale(1); }
    to { opacity: 0; transform: scale(0.9); }
  `,
  shimmer: `
    0% { background-position: -400% 0; }
    100% { background-position: 400% 0; }
  `,
  "float-gentle": `
    0%,100% { transform: translateY(0) rotate(0); }
    33% { transform: translateY(-10px) rotate(1deg); }
    66% { transform: translateY(-5px) rotate(-1deg); }
  `,
  "slide-in-up": `
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  `,
  "slide-in-right": `
    from { transform: translateX(30px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  `,
  ripple: `
    0% { transform: scale(0); opacity: 0.5; }
    100% { transform: scale(2); opacity: 0; }
  `,
  "featured-glow": `
    0% { opacity: .6; filter: blur(8px); }
    100% { opacity: .9; filter: blur(12px); }
  `,
  "gradient-rotate": `
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  `,
} as const;
