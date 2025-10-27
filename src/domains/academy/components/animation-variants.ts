// Animation variants for academy components
import { Variants } from "framer-motion";

export const cardHoverVariant = {
  whileHover: { y: -6 },
  transition: { type: "spring" as const, stiffness: 300 },
};

export const fadeInUpVariant = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export const fadeInUpDelayedVariant = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: 0.1 },
};

export const tabSwitchVariant = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3 },
};
