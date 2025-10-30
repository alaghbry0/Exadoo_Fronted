import {
  auroraDarkTokens,
  auroraTokens,
  colorVariables,
  effectTokens,
  gradientTokens,
} from "./foundation";

const colorAlias = {
  text: {
    primary: "--color-text-primary",
    secondary: "--color-text-secondary",
    tertiary: "--color-text-tertiary",
    disabled: "--color-text-disabled",
    inverse: "--color-text-inverse",
    link: "--color-text-link",
    linkHover: "--color-text-link-hover",
  },
  bg: {
    primary: "--color-bg-primary",
    secondary: "--color-bg-secondary",
    tertiary: "--color-bg-tertiary",
    elevated: "--color-bg-elevated",
    gradientPrimary: "--color-bg-gradient-primary",
    gradientElevated: "--color-bg-gradient-elevated",
    overlay: "--color-bg-overlay",
    inverse: "--color-bg-inverse",
  },
  border: {
    default: "--color-border-default",
    hover: "--color-border-hover",
    focus: "--color-border-focus",
    disabled: "--color-border-disabled",
    error: "--color-border-error",
  },
  brand: {
    primary: "--color-primary-500",
    primaryHover: "--color-primary-600",
    primaryActive: "--color-primary-700",
    secondary: "--color-secondary-500",
    secondaryHover: "--color-secondary-600",
  },
  status: {
    success: "--color-success-500",
    successBg: "--color-success-50",
    warning: "--color-warning-500",
    warningBg: "--color-warning-50",
    error: "--color-error-500",
    errorBg: "--color-error-50",
    info: "--color-info-500",
    infoBg: "--color-info-50",
  },
} as const;

type AliasTree = typeof colorAlias;

type CssVarTree<T> = {
  [K in keyof T]: T[K] extends string ? string : CssVarTree<T[K]>;
};

const mapAliasToCssVar = <T extends Record<string, unknown>>(aliases: T): CssVarTree<T> => {
  return Object.fromEntries(
    Object.entries(aliases).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, `var(${value})`];
      }

      return [key, mapAliasToCssVar(value as Record<string, unknown>)];
    }),
  ) as CssVarTree<T>;
};

export const colors: CssVarTree<AliasTree> = mapAliasToCssVar(colorAlias);

const toCssLines = (record: Record<string, string>) =>
  Object.entries(record)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");

const buildVariableBlock = () => {
  const baseVariables: Record<string, string> = {};
  const darkVariables: Record<string, string> = {};

  for (const [name, values] of Object.entries(colorVariables)) {
    baseVariables[name] = values.light;
    if (values.dark && values.dark !== values.light) {
      darkVariables[name] = values.dark;
    }
  }

  for (const [name, values] of Object.entries(gradientTokens)) {
    baseVariables[name] = values.light;
    if (values.dark && values.dark !== values.light) {
      darkVariables[name] = values.dark;
    }
  }

  for (const [name, values] of Object.entries(effectTokens)) {
    baseVariables[name] = values.light;
    if (values.dark && values.dark !== values.light) {
      darkVariables[name] = values.dark;
    }
  }

  Object.assign(baseVariables, auroraTokens);
  Object.assign(darkVariables, auroraDarkTokens);

  const root = toCssLines(baseVariables);
  const dark = toCssLines(darkVariables);

  return `:root {\n${root}\n}\n${dark ? `.dark {\n${dark}\n}` : ""}`.trim();
};

export const colorVars = buildVariableBlock();
