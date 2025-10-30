import {
  keyframeDefinitions,
  motionDurations,
  motionEasing,
  reducedMotionStyles,
} from "./foundation";

export const animations = {
  duration: motionDurations,
  easing: motionEasing,
  presets: {
    fadeIn: "animate-fade-in",
    fadeOut: "animate-fade-out",
    slideUp: "animate-slide-up",
    slideDown: "animate-slide-down",
    slideLeft: "animate-slide-left",
    slideRight: "animate-slide-right",
    scaleIn: "animate-scale-in",
    scaleOut: "animate-scale-out",
    spin: "animate-spin",
    pulse: "animate-pulse",
    bounce: "animate-bounce",
  },
} as const;

const buildKeyframes = () =>
  Object.entries(keyframeDefinitions)
    .map(([name, body]) => `@keyframes ${name} {\n${body}\n}`)
    .join("\n\n");

const animationPresetCss = `
.animate-fade-in {
  animation: fade-in ${motionDurations.normal} ${motionEasing.out};
}

.animate-fade-out {
  animation: fade-out ${motionDurations.normal} ${motionEasing.out};
}

.animate-slide-up {
  animation: slide-up ${motionDurations.slow} ${motionEasing.out};
}

.animate-slide-down {
  animation: slide-down ${motionDurations.slow} ${motionEasing.out};
}

.animate-slide-left {
  animation: slide-left ${motionDurations.slow} ${motionEasing.out};
}

.animate-slide-right {
  animation: slide-right ${motionDurations.slow} ${motionEasing.out};
}

.animate-scale-in {
  animation: scale-in ${motionDurations.normal} ${motionEasing.out};
}

.animate-scale-out {
  animation: scale-out ${motionDurations.normal} ${motionEasing.out};
}
`.trim();

export const animationCss = [buildKeyframes(), animationPresetCss, reducedMotionStyles].join("\n\n");
