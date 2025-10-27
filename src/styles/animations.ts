// src/styles/animations.ts
/**
 * Unified Animation Variants for Framer Motion
 * Follow DESIGN_SYSTEM.md guidelines
 * 
 * @note هذا الملف يحتوي على جميع animation variants المشتركة
 */

import type { Variant } from "framer-motion";

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
} as const;

// Re-export للتوافق مع الكود القديم
export const forexAnimations = animations;
export const indicatorsAnimations = animations;
