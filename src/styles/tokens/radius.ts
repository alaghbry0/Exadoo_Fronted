import {
  componentRadiusValues,
  radiusScale,
  radiusVariables,
} from "./foundation";

export const radius = radiusScale;

const componentClassName = (token: string) => `radius-component-${token}`;
const scaleClassName = (token: string) => `radius-scale-${token}`;

export const componentRadius = Object.fromEntries(
  Object.keys(componentRadiusValues).map((key) => [key, componentClassName(key)]),
) as Record<keyof typeof componentRadiusValues, string>;

export const radiusClasses = {
  default: scaleClassName("xl"),
  sm: scaleClassName("lg"),
  md: scaleClassName("xl"),
  lg: scaleClassName("2xl"),
  full: scaleClassName("full"),
  none: scaleClassName("none"),
} as const;

const toCssLines = (record: Record<string, string>) =>
  Object.entries(record)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");

export const radiusVars = `:root {\n${toCssLines(radiusVariables)}\n}`;
