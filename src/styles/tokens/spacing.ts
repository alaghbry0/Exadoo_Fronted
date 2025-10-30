import { semanticSpacingVariables, spacingScale, spacingVariables } from "./foundation";

export const spacing = spacingScale;

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

const toCssLines = (record: Record<string, string>) =>
  Object.entries(record)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");

export const spacingVars = `:root {\n${toCssLines(spacingVariables)}\n${toCssLines(semanticSpacingVariables)}\n}`;
