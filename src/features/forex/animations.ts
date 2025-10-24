/**
 * Forex Page - Animation Variants
 * استخراج inline animations إلى variants قابلة لإعادة الاستخدام
 */

export const forexAnimations = {
  // Hero & Feature animations
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
