import fs from "fs";
import path from "path";

import { colorVars } from "../src/styles/tokens/colors";
import { spacingVars } from "../src/styles/tokens/spacing";
import { radiusVars, componentRadius } from "../src/styles/tokens/radius";
import { typographyCss, fontVars } from "../src/styles/tokens/typography";
import { shadowCss, shadowClasses } from "../src/styles/tokens/shadows";
import { animationCss } from "../src/styles/tokens/animations";
import {
  componentRadiusValues,
  keyframeDefinitions,
  motionDurations,
  motionEasing,
  radiusScale,
  shadowComposite,
  spacingScale,
  reducedMotionStyles,
} from "../src/styles/tokens/foundation";

const ROOT_DIR = path.join(__dirname, "../");
const TOKENS_CSS_PATH = path.join(ROOT_DIR, "src/styles/tokens.css");
const CRITICAL_CSS_PATH = path.join(ROOT_DIR, "src/styles/critical.css");
const CRITICAL_INLINE_PATH = path.join(ROOT_DIR, "src/styles/critical-inline.ts");

const HEADER = `/**\n * Auto-generated file. Do not edit directly.\n */`;

const ensureTrailingNewline = (content: string) => (content.endsWith("\n") ? content : `${content}\n`);

const buildComponentRadiusCss = () => {
  const componentRules = Object.entries(componentRadiusValues)
    .map(([token, value]) => `.${componentRadius[token as keyof typeof componentRadius]} {\n  border-radius: ${value};\n}`)
    .join("\n\n");

  const scaleRules = Object.entries(radiusScale)
    .map(([token, value]) => `.${`radius-scale-${token}`} {\n  border-radius: ${value};\n}`)
    .join("\n\n");

  return [componentRules, scaleRules].filter(Boolean).join("\n\n");
};

const buildSpacingUtilityCss = () => {
  const paddingUtilities = [
    ["p-4", spacingScale[4]],
    ["px-4", `${spacingScale[4]} ${spacingScale[4]}`],
    ["py-4", `${spacingScale[4]} ${spacingScale[4]}`],
    ["mt-4", spacingScale[4]],
    ["mb-4", spacingScale[4]],
  ] as const;

  const declarations = paddingUtilities.map(([token, value]) => {
    if (token.startsWith("p")) {
      if (token === "p-4") {
        return `.p-4 {\n  padding: ${value};\n}`;
      }

      if (token === "px-4") {
        return `.px-4 {\n  padding-left: ${spacingScale[4]};\n  padding-right: ${spacingScale[4]};\n}`;
      }

      if (token === "py-4") {
        return `.py-4 {\n  padding-top: ${spacingScale[4]};\n  padding-bottom: ${spacingScale[4]};\n}`;
      }
    }

    if (token === "mt-4") {
      return `.mt-4 {\n  margin-top: ${value};\n}`;
    }

    if (token === "mb-4") {
      return `.mb-4 {\n  margin-bottom: ${value};\n}`;
    }

    return "";
  });

  return declarations.filter(Boolean).join("\n\n");
};

const buildFlexUtilityCss = () => {
  const utilities: Record<string, string> = {
    ".min-h-screen": "min-height: 100vh;",
    ".flex": "display: flex;",
    ".items-center": "align-items: center;",
    ".justify-center": "justify-content: center;",
    ".flex-col": "flex-direction: column;",
    ".text-center": "text-align: center;",
  };

  return Object.entries(utilities)
    .map(([selector, body]) => `${selector} {\n  ${body}\n}`)
    .join("\n\n");
};

const buildTypographyUtilityCss = () => {
  const sizes: Record<string, string> = {
    ".text-xl": "font-size: 1.25rem;",
    ".text-2xl": "font-size: 1.5rem;",
    ".text-3xl": "font-size: 1.875rem;",
  };

  const weights: Record<string, string> = {
    ".font-bold": "font-weight: 700;",
    ".font-semibold": "font-weight: 600;",
  };

  return [sizes, weights]
    .flatMap((group) =>
      Object.entries(group).map(([selector, declaration]) => `${selector} {\n  ${declaration}\n}`),
    )
    .join("\n\n");
};

const buildColorUtilityCss = () => {
  return [
    `.text-primary {\n  color: var(--color-primary-500);\n}`,
    `.bg-primary {\n  background-color: var(--color-primary-500);\n}`,
    `.text-white {\n  color: var(--color-text-inverse);\n}`,
    `.bg-white {\n  background-color: var(--color-bg-primary);\n}`,
  ].join("\n\n");
};

const buildRadiusUtilityCss = () => {
  return [
    `.rounded {\n  border-radius: ${radiusScale.base};\n}`,
    `.rounded-lg {\n  border-radius: ${radiusScale.lg};\n}`,
    `.rounded-xl {\n  border-radius: ${radiusScale.xl};\n}`,
    `.rounded-2xl {\n  border-radius: ${radiusScale["2xl"]};\n}`,
  ].join("\n\n");
};

const buildShadowUtilityCss = () => {
  return [
    `.shadow {\n  box-shadow: ${shadowComposite.surfaceGlow};\n}`,
    `.shadow-lg {\n  box-shadow: ${shadowComposite.floatingFab};\n}`,
    `.transition {\n  transition-property: all;\n  transition-duration: ${motionDurations.fast};\n  transition-timing-function: ${motionEasing.default};\n}`,
  ].join("\n\n");
};

const buildSkeletonCss = () => {
  const shimmer = keyframeDefinitions["shimmer"] ?? "0% { opacity: 1; } 100% { opacity: 1; }";

  const lightTrack = `linear-gradient(90deg, color-mix(in srgb, var(--color-border-default) 65%, transparent) 25%, var(--color-bg-tertiary) 50%, color-mix(in srgb, var(--color-border-default) 65%, transparent) 75%)`;
  const darkTrack = `linear-gradient(90deg, color-mix(in srgb, var(--color-border-default) 35%, transparent) 25%, color-mix(in srgb, var(--color-border-hover) 55%, transparent) 50%, color-mix(in srgb, var(--color-border-default) 35%, transparent) 75%)`;

  return `@keyframes shimmer {\n${shimmer}\n}\n\n.skeleton {\n  background: ${lightTrack};\n  background-size: 200% 100%;\n  animation: shimmer 1.5s ${motionEasing.out} infinite;\n}\n\n@media (prefers-color-scheme: dark) {\n  .skeleton {\n    background: ${darkTrack};\n  }\n}`;
};

const buildCriticalCss = () => {
  const base = [
    `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}`,
    `html{-webkit-text-size-adjust:100%;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}`,
    `body{font-family:var(--font-arabic);line-height:1.5;color:var(--color-text-primary);background:var(--color-bg-primary)}`,
    `html[dir="rtl"]{direction:rtl}`,
  ].join("\n");

  const lightBlocks = [
    buildFlexUtilityCss(),
    buildSpacingUtilityCss(),
    buildTypographyUtilityCss(),
    buildColorUtilityCss(),
    buildRadiusUtilityCss(),
    buildShadowUtilityCss(),
    buildSkeletonCss(),
  ]
    .filter(Boolean)
    .join("\n\n");

  const darkOverrides = `@media(prefers-color-scheme:dark){body{color:var(--color-text-primary);background:var(--color-bg-primary)}.${shadowClasses.glow} {box-shadow: ${shadowComposite.surfaceGlow};}}`;

  return [colorVars, fontVars, base, lightBlocks, darkOverrides, reducedMotionStyles].filter(Boolean).join("\n\n");
};

const buildTokensCss = () => {
  const sections = [
    colorVars,
    spacingVars,
    radiusVars,
    fontVars,
    buildComponentRadiusCss(),
    typographyCss,
    shadowCss,
    animationCss,
  ];

  return sections.filter(Boolean).map(ensureTrailingNewline).join("\n");
};

const writeFile = (filePath: string, contents: string) => {
  fs.writeFileSync(filePath, ensureTrailingNewline(`${HEADER}\n${contents.trim()}\n`), "utf-8");
  console.log(`✏️  Wrote ${path.relative(ROOT_DIR, filePath)}`);
};

const minifyCss = (css: string) =>
  css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();

const generate = () => {
  const tokensCss = buildTokensCss();
  const criticalCss = buildCriticalCss();

  writeFile(TOKENS_CSS_PATH, tokensCss);
  writeFile(CRITICAL_CSS_PATH, criticalCss);

  const minified = minifyCss(criticalCss);
  const inline = `${HEADER}\n\nexport const criticalCss = \`${minified}\`;`;
  fs.writeFileSync(CRITICAL_INLINE_PATH, ensureTrailingNewline(inline), "utf-8");
  console.log(`✏️  Wrote ${path.relative(ROOT_DIR, CRITICAL_INLINE_PATH)}`);
};

generate();
