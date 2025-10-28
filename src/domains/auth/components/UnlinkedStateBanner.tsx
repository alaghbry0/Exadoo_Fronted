// src/features/auth/components/UnlinkedStateBanner.tsx
"use client";
import { cn } from "@/shared/utils";
import {
  colors,
  gradients,
  shadowClasses,
  shadows,
  withAlpha,
} from "@/styles/tokens";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/shared/state/zustand/userStore";
import { Smartphone, CheckCircle2, Gift, Zap, X, Sparkles } from "lucide-react";

interface UnlinkedStateBannerProps {
  onLinkClick: () => void;
  showFeatures?: boolean;
}

const UnlinkedStateBanner: React.FC<UnlinkedStateBannerProps> = ({
  onLinkClick,
  showFeatures = true,
}) => {
  const { isLinked } = useUserStore();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isLinked || isDismissed) return null;

  const features = [
    {
      icon: Zap,
      title: "وصول فوري",
      description: "استعراض جميع الخدمات والأدوات",
    },
    {
      icon: Gift,
      title: "عروض حصرية",
      description: "خصومات خاصة للمستخدمين المربوطين",
    },
    {
      icon: Sparkles,
      title: "تجربة محسنة",
      description: "مزامنة سلسة بين الموبايل والويب",
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="relative"
      >
        {/* Mobile Version */}
        <div
          className={cn(
            "md:hidden relative overflow-hidden rounded-2xl p-5",
            shadowClasses.cardElevated,
          )}
          style={{
            background: gradients.brand.primary,
            color: colors.text.inverse,
          }}
        >
          <button
            onClick={() => setIsDismissed(true)}
            className={cn("absolute top-3 left-3", "token-icon-button")}
            style={{
              "--token-icon-size": "2rem",
              "--token-icon-bg": withAlpha(colors.bg.inverse, 0.15),
              "--token-icon-bg-hover": withAlpha(colors.bg.inverse, 0.25),
              "--token-icon-color": colors.text.inverse,
              "--token-icon-color-hover": colors.text.inverse,
              "--token-icon-shadow": shadows.colored.primary.sm,
              "--token-icon-shadow-hover": shadows.colored.primary.md,
            } as React.CSSProperties}
            aria-label="إخفاء"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4 mb-4">
            <div
              className="backdrop-blur-sm p-3 rounded-xl"
              style={{
                backgroundColor: withAlpha(colors.bg.inverse, 0.25),
                color: colors.text.inverse,
              }}
            >
              <Smartphone className="w-7 h-7" aria-hidden />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1" style={{ color: colors.text.inverse }}>
                اربط حسابك الآن
              </h3>
              <p className="text-sm" style={{ color: withAlpha(colors.text.inverse, 0.9) }}>
                للوصول الكامل لجميع الميزات والخدمات
              </p>
            </div>
          </div>

          <button
            onClick={onLinkClick}
            className={cn(
              "w-full rounded-xl font-bold py-3",
              shadowClasses.buttonElevated,
              "token-interactive",
            )}
            style={{
              "--token-bg": colors.bg.primary,
              "--token-bg-hover": withAlpha(colors.bg.primary, 0.9),
              "--token-bg-active": withAlpha(colors.bg.primary, 0.85),
              "--token-fg": colors.brand.primary,
              "--token-fg-hover": colors.brand.primaryHover,
              "--token-shadow": shadows.colored.primary.sm,
              "--token-shadow-hover": shadows.colored.primary.md,
              "--token-shadow-active": shadows.colored.primary.sm,
              "--token-transform-hover": "translateY(-0.1875rem)",
              "--token-transform-active": "translateY(-0.0625rem)",
            } as React.CSSProperties}
          >
            ربط الحساب
          </button>
        </div>

        {/* Desktop Version */}
        <div
          className={cn(
            "hidden md:block p-8 relative overflow-hidden rounded-3xl",
            shadowClasses.cardElevated,
          )}
          style={{
            background: gradients.surface.elevated,
            color: colors.text.primary,
          }}
        >
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
            style={{ background: withAlpha(colors.brand.primary, 0.12) }}
            aria-hidden
          />
          <div
            className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"
            style={{ background: withAlpha(colors.brand.secondary, 0.1) }}
            aria-hidden
          />

          <button
            onClick={() => setIsDismissed(true)}
            className={cn("absolute top-4 left-4 z-10", "token-icon-button")}
            style={{
              "--token-icon-size": "2.5rem",
              "--token-icon-radius": "9999px",
              "--token-icon-bg": withAlpha(colors.bg.overlay, 0.12),
              "--token-icon-bg-hover": withAlpha(colors.bg.overlay, 0.18),
              "--token-icon-color": colors.text.tertiary,
              "--token-icon-color-hover": colors.text.secondary,
              "--token-icon-shadow": shadows.elevation[1],
              "--token-icon-shadow-hover": shadows.elevation[2],
            } as React.CSSProperties}
            aria-label="إخفاء"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-8">
              <div className="flex-1">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-4"
                  style={{
                    backgroundColor: withAlpha(colors.brand.primary, 0.15),
                    color: colors.brand.primary,
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>ميزة حصرية</span>
                </div>

                <h2 className="text-3xl font-bold mb-3" style={{ color: colors.text.primary }}>
                  اربط حسابك للوصول الكامل
                </h2>
                <p className="text-lg mb-6 max-w-xl" style={{ color: colors.text.secondary }}>
                  قم بمزامنة حسابك مع تطبيق الموبايل للاستفادة من جميع الخدمات
                  والحصول على تجربة متكاملة
                </p>

                {showFeatures && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {features.map((feature, index) => (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-start gap-3 p-4 rounded-xl"
                        style={{
                          backgroundColor: colors.bg.secondary,
                          borderColor: colors.border.default,
                          borderWidth: "1px",
                        }}
                      >
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: withAlpha(colors.brand.primary, 0.15) }}
                        >
                          <feature.icon className="w-5 h-5" style={{ color: colors.brand.primary }} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-0.5" style={{ color: colors.text.primary }}>
                            {feature.title}
                          </h4>
                          <p className="text-xs" style={{ color: colors.text.secondary }}>
                            {feature.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                <button
                  onClick={onLinkClick}
                  className={cn(
                    "inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold",
                    shadowClasses.buttonElevated,
                    "token-interactive",
                  )}
                  style={{
                    "--token-bg": gradients.brand.primary,
                    "--token-bg-hover": gradients.brand.primaryHover,
                    "--token-bg-active": gradients.brand.primaryActive,
                    "--token-fg": colors.text.inverse,
                    "--token-shadow": shadows.colored.primary.md,
                    "--token-shadow-hover": shadows.colored.primary.lg,
                    "--token-shadow-active": shadows.colored.primary.md,
                    "--token-transform-hover": "translateY(-0.25rem)",
                    "--token-transform-active": "translateY(-0.125rem)",
                  } as React.CSSProperties}
                >
                  <Smartphone className="w-5 h-5" />
                  <span>ربط الحساب الآن</span>
                </button>
              </div>

              <div className="hidden lg:block">
                <div className="relative">
                  <div
                    className="w-48 h-48 rounded-3xl flex items-center justify-center transition-transform duration-500"
                    style={{
                      background: gradients.brand.subtle,
                    }}
                  >
                    <Smartphone className="w-24 h-24" style={{ color: colors.brand.primary }} />
                  </div>
                  <div
                    className="absolute -top-4 -right-4 p-2 rounded-full"
                    style={{
                      background: gradients.status.success,
                      color: colors.text.inverse,
                      boxShadow: shadows.colored.primary.md,
                    }}
                  >
                    <CheckCircle2 className="w-6 h-6" aria-hidden />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UnlinkedStateBanner;
