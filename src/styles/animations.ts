// src/styles/animations.ts
/**
 * Unified Animation Variants for Framer Motion
 * Follow DESIGN_SYSTEM.md guidelines
 * 
 * @note هذا الملف يحتوي على جميع animation variants المشتركة
 */

import { shadows } from "./tokens/shadows";

const subscriptionSpring = {
  type: "spring" as const,
  damping: 25,
  stiffness: 200,
  mass: 0.5,
};

export const animations = {
  // Page transitions
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },

  // Card animations
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.4, ease: "easeOut" },
  },

  // Scale animations
  scaleIn: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.2 },
  },

  // List animations
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },

  staggerItem: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  },

  // Hero & Feature animations (من forex و indicators)
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  },

  // Staggered items (للقوائم)
  staggeredFadeIn: (index: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.2 + index * 0.1 },
  }),

  // Hero content animation
  heroContent: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },

  // Hero paragraph animation
  heroParagraph: {
    transition: { delay: 0.1 },
  },

  // Hero button animation
  heroButton: {
    transition: { delay: 0.2 },
  },

  // Card hover animation
  cardHover: {
    whileHover: { y: -4 },
    transition: { duration: 0.2 },
  },

  subscriptionItem: {
    hidden: { opacity: 0, y: 20 },
    visible: (index: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.07,
        ...subscriptionSpring,
      },
    }),
    exit: { opacity: 0, y: 20 },
  },

  subscriptionAccordion: {
    open: {
      height: "auto",
      opacity: 1,
      transition: {
        ...subscriptionSpring,
        staggerChildren: 0.05,
      },
    },
    collapsed: {
      height: 0,
      opacity: 0,
      transition: {
        ...subscriptionSpring,
        staggerChildren: 0.02,
        staggerDirection: -1,
      },
    },
  },

  subscriptionLinkGrid: {
    open: {
      transition: { staggerChildren: 0.1 },
    },
    collapsed: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  },

  subscriptionLinkItem: {
    hidden: { opacity: 0, y: 10 },
    visible: (index: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.05,
        ...subscriptionSpring,
      },
    }),
    exit: { opacity: 0, y: -10 },
  },

  subscriptionLinkCard: {
    whileHover: {
      scale: 1.03,
      y: -3,
      boxShadow: shadows.elevation[4],
    },
    whileTap: {
      scale: 0.97,
      boxShadow: shadows.elevation[2],
    },
    transition: subscriptionSpring,
  },

  subscriptionToggle: {
    whileTap: { scale: 0.98 },
  },

  subscriptionToggleIcon: {
    open: {
      rotate: 180,
      transition: subscriptionSpring,
    },
    collapsed: {
      rotate: 0,
      transition: subscriptionSpring,
    },
  },
} as const;

// Re-export للتوافق مع الكود القديم
export const forexAnimations = animations;
export const indicatorsAnimations = animations;

export const springs = {
  subscription: subscriptionSpring,
};
