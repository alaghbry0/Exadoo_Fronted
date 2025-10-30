import { fontVariables, typographyScale } from "./foundation";

const typographyGroupFont = {
  display: "var(--font-display)",
  heading: "var(--font-sans)",
  body: "var(--font-sans)",
  label: "var(--font-sans)",
  caption: "var(--font-sans)",
} as const;

export const typography = Object.fromEntries(
  Object.entries(typographyScale).map(([group, variants]) => [
    group,
    Object.fromEntries(
      Object.keys(variants).map((variantKey) => [
        variantKey,
        `typo-${group}-${variantKey}`,
      ]),
    ),
  ]),
) as {
  [Group in keyof typeof typographyScale]: {
    [Variant in keyof (typeof typographyScale)[Group]]: string;
  };
};

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

// Font families
export const fontFamily = {
  sans: "var(--font-sans)",
  arabic: "var(--font-arabic)",
  display: "var(--font-display, var(--font-sans))",
  mono: "var(--font-mono, ui-monospace)",
} as const;

const buildTypographyCss = () => {
  return Object.entries(typographyScale)
    .map(([group, variants]) => {
      const fontFamily = typographyGroupFont[group as keyof typeof typographyGroupFont];

      return Object.entries(variants)
        .map(([variant, values]) => {
          const { fontSize, lineHeight: line, fontWeight: weight, letterSpacing } = values;
          const declarations = [
            `  font-family: ${fontFamily};`,
            `  font-size: ${fontSize};`,
            `  line-height: ${line};`,
            `  font-weight: ${weight};`,
            letterSpacing !== undefined ? `  letter-spacing: ${letterSpacing}em;` : null,
          ]
            .filter(Boolean)
            .join("\n");

          return `.typo-${group}-${variant} {\n${declarations}\n}`;
        })
        .join("\n\n");
    })
    .join("\n\n");
};

const buildFontVariableCss = () =>
  Object.entries(fontVariables)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");

export const fontVars = `:root {\n${buildFontVariableCss()}\n}`;

export const typographyCss = buildTypographyCss();
