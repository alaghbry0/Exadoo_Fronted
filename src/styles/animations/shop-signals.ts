// src/styles/animations/shop-signals.ts
/**
 * Motion presets for the shop signals page.
 *
 * These presets centralize repeated motion configs so the page can
 * simply spread the shared variants/transition settings.
 */

const fadeInUpBase = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
} as const;

const springCardTransition = {
  type: "spring" as const,
  stiffness: 200,
  damping: 25,
};

const heroTransition = {
  duration: 0.5,
  ease: "easeOut" as const,
};

const infoSwapTransition = {
  duration: 0.3,
  ease: "easeOut" as const,
};

const scrollButtonTransition = {
  duration: 0.2,
  ease: "easeInOut" as const,
};

const pillSwitchTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

export const shopSignalsAnimations = {
  heroTitle: {
    ...fadeInUpBase,
    transition: { ...heroTransition, delay: 0.2 },
  },
  heroSubtitle: {
    ...fadeInUpBase,
    transition: { ...heroTransition, delay: 0.3 },
  },
  scrollButton: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: scrollButtonTransition,
  },
  emptyState: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: infoSwapTransition,
  },
  subscriptionCard: (index: number) => ({
    layout: true,
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { ...springCardTransition, delay: index * 0.1 },
  }),
  priceHighlight: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: infoSwapTransition,
  },
  tieredDiscountInfo: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: infoSwapTransition,
  },
  standardDiscountInfo: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: infoSwapTransition,
  },
} as const;

export const shopSignalsTransitions = {
  pillSwitch: pillSwitchTransition,
} as const;
