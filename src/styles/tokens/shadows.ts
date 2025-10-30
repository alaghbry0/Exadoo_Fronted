import {
  motionDurations,
  motionEasing,
  shadowColored,
  shadowComposite,
  shadowElevation,
  shadowInner,
} from "./foundation";

export const shadows = {
  elevation: shadowElevation,
  colored: shadowColored,
  inner: shadowInner,
  composite: shadowComposite,
  glow: {
    sm: shadowColored.primary.sm,
    md: shadowColored.primary.md,
    lg: shadowColored.primary.lg,
    blue: shadowColored.primary.glow,
    purple: "0 0 40px rgba(139, 92, 246, 0.3)",
  },
} as const;

const createClassName = (token: string) => `shadow-${token}`;

export const shadowClasses = {
  card: createClassName("card"),
  cardHover: createClassName("card-hover"),
  cardElevated: createClassName("card-elevated"),
  cardInteractive: createClassName("card-interactive"),
  modal: createClassName("modal"),
  dialog: createClassName("dialog"),
  dropdown: createClassName("dropdown"),
  popover: createClassName("popover"),
  tooltip: createClassName("tooltip"),
  button: createClassName("button"),
  buttonElevated: createClassName("button-elevated"),
  input: createClassName("input"),
  glow: createClassName("glow"),
  glowPurple: createClassName("glow-purple"),
  fab: createClassName("fab"),
  none: createClassName("none"),
} as const;

type ShadowClassKey = keyof typeof shadowClasses;

type ShadowClassDefinition = {
  base: string;
  hover?: string;
  focus?: string;
  active?: string;
  darkBase?: string;
};

const toRule = (selector: string, declarations: string[]) =>
  declarations.length ? `${selector} {\n${declarations.map((line) => `  ${line}`).join("\n")}\n}` : "";

const shadowClassConfig: Record<ShadowClassKey, ShadowClassDefinition> = {
  card: {
    base: `box-shadow: ${shadowElevation[3]}; transition: box-shadow ${motionDurations.slow} ${motionEasing.out};`,
    hover: `box-shadow: ${shadowElevation[4]};`,
  },
  cardHover: {
    base: `box-shadow: ${shadowElevation[4]}; transition: box-shadow ${motionDurations.slow} ${motionEasing.out};`,
    hover: `box-shadow: ${shadowElevation[5]};`,
  },
  cardElevated: {
    base: `box-shadow: ${shadowElevation[5]};`,
  },
  cardInteractive: {
    base: `box-shadow: ${shadowElevation[3]}; transition: box-shadow ${motionDurations.slow} ${motionEasing.out}, transform ${motionDurations.slow} ${motionEasing.out};`,
    hover: `box-shadow: ${shadowElevation[6]}; transform: translateY(-0.25rem);`,
  },
  modal: {
    base: `box-shadow: ${shadowElevation[6]};`,
  },
  dialog: {
    base: `box-shadow: ${shadowElevation[6]};`,
  },
  dropdown: {
    base: `box-shadow: ${shadowElevation[4]};`,
  },
  popover: {
    base: `box-shadow: ${shadowElevation[4]};`,
  },
  tooltip: {
    base: `box-shadow: ${shadowElevation[3]};`,
  },
  button: {
    base: `box-shadow: ${shadowElevation[1]}; transition: box-shadow ${motionDurations.fast} ${motionEasing.out};`,
    hover: `box-shadow: ${shadowElevation[2]};`,
    active: `box-shadow: ${shadowElevation[1]};`,
  },
  buttonElevated: {
    base: `box-shadow: ${shadowElevation[3]}; transition: box-shadow ${motionDurations.fast} ${motionEasing.out};`,
    hover: `box-shadow: ${shadowElevation[4]};`,
    active: `box-shadow: ${shadowElevation[3]};`,
  },
  input: {
    base: `box-shadow: ${shadowElevation[1]}; transition: box-shadow ${motionDurations.fast} ${motionEasing.out};`,
    focus: `box-shadow: ${shadowElevation[3]};`,
  },
  glow: {
    base: `box-shadow: ${shadowColored.primary.glow};`,
  },
  glowPurple: {
    base: `box-shadow: 0 0 40px rgba(139, 92, 246, 0.3);`,
  },
  fab: {
    base: `box-shadow: ${shadowComposite.floatingFab}; transition: box-shadow ${motionDurations.slow} ${motionEasing.out};`,
    darkBase: `box-shadow: 0 22px 50px rgba(0, 0, 0, 0.55);`,
  },
  none: {
    base: `box-shadow: none;`,
  },
};

export const shadowCss = Object.entries(shadowClassConfig)
  .map(([key, config]) => {
    const className = shadowClasses[key as ShadowClassKey];
    const rules = [toRule(`.${className}`, [config.base].filter(Boolean) as string[])];

    if (config.hover) {
      rules.push(toRule(`.${className}:hover`, [config.hover]));
    }

    if (config.focus) {
      rules.push(toRule(`.${className}:focus, .${className}:focus-visible`, [config.focus]));
    }

    if (config.active) {
      rules.push(toRule(`.${className}:active`, [config.active]));
    }

    if (config.darkBase) {
      rules.push(toRule(`.dark .${className}`, [config.darkBase]));
    }

    return rules.filter(Boolean).join("\n");
  })
  .filter(Boolean)
  .join("\n\n");

export type ShadowType = keyof typeof shadowClasses;

export const compositeShadows = shadows.composite;
