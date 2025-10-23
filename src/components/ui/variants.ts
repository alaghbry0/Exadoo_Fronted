/**
 * Component Variants - أنماط موحدة للمكونات
 * يوفر variants جاهزة للاستخدام المباشر
 */

import { componentRadius as _componentRadius } from "@/styles/tokens";

export const componentVariants = {
  // Card variants
  card: {
    base: "bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800",
    elevated:
      "shadow-elevation-2 hover:shadow-elevation-4 transition-shadow duration-300",
    interactive:
      "cursor-pointer hover:-translate-y-0.5 transition-all duration-300",
    glass:
      "bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-white/20 dark:border-neutral-800/20",
    gradient:
      "bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950",
  },

  // Button variants
  button: {
    base: "inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
    primary:
      "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 active:scale-95",
    secondary:
      "bg-secondary-500 text-white hover:bg-secondary-600 active:scale-95",
    outline:
      "border-2 border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950 active:scale-95",
    ghost:
      "text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950 active:scale-95",
    danger: "bg-error-500 text-white hover:bg-error-600 active:scale-95",
  },

  // Input variants
  input: {
    base: "w-full px-4 py-2 border transition-colors duration-200 focus:outline-none focus:ring-2",
    default:
      "border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:border-primary-500 focus:ring-primary-500/20",
    error: "border-error-500 focus:border-error-500 focus:ring-error-500/20",
    success:
      "border-success-500 focus:border-success-500 focus:ring-success-500/20",
  },

  // Badge variants
  badge: {
    base: "inline-flex items-center px-2.5 py-0.5 text-xs font-medium",
    primary:
      "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300",
    secondary:
      "bg-secondary-100 text-secondary-700 dark:bg-secondary-900 dark:text-secondary-300",
    success:
      "bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300",
    warning:
      "bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300",
    error: "bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-300",
    neutral:
      "bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300",
  },

  // Alert variants
  alert: {
    base: "p-4 border-l-4",
    info: "bg-primary-50 border-primary-500 text-primary-900 dark:bg-primary-950 dark:text-primary-100",
    success:
      "bg-success-50 border-success-500 text-success-900 dark:bg-success-950 dark:text-success-100",
    warning:
      "bg-warning-50 border-warning-500 text-warning-900 dark:bg-warning-950 dark:text-warning-100",
    error:
      "bg-error-50 border-error-500 text-error-900 dark:bg-error-950 dark:text-error-100",
  },

  // Avatar variants
  avatar: {
    base: "inline-flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-neutral-800",
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl",
    "2xl": "w-20 h-20 text-2xl",
  },

  // Skeleton variants
  skeleton: {
    base: "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800",
    text: "h-4 rounded",
    title: "h-6 rounded",
    avatar: "rounded-full",
    button: "h-10 rounded-xl",
    card: "h-48 rounded-2xl",
  },
} as const;

// Size variants
export const sizeVariants = {
  button: {
    xs: "px-2.5 py-1.5 text-xs",
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl",
  },
  input: {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-3 text-lg",
  },
  icon: {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
    "2xl": "w-10 h-10",
  },
} as const;

// Helper function لدمج الـ variants
export function mergeVariants(
  ...variants: (string | undefined | false)[]
): string {
  return variants.filter(Boolean).join(" ");
}
