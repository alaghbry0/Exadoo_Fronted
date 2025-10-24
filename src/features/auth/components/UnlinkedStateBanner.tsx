// src/features/auth/components/UnlinkedStateBanner.tsx
"use client";
import { cn } from "@/lib/utils";
import { componentVariants, mergeVariants } from "@/components/ui/variants";
import { colors } from '@/styles/tokens';

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/stores/zustand/userStore";
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
            componentVariants.card.elevated,
            "md:hidden bg-gradient-to-br from-primary-500 to-primary-700 text-white p-5 relative overflow-hidden",
          )}
        >
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute top-3 left-3 p-1 text-white/80 hover:text-white transition-colors"
            aria-label="إخفاء"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <Smartphone className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">اربط حسابك الآن</h3>
              <p className="text-sm text-white/90">
                للوصول الكامل لجميع الميزات والخدمات
              </p>
            </div>
          </div>

          <button
            onClick={onLinkClick}
            className="w-full bg-white text-primary-600 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            ربط الحساب
          </button>
        </div>

        {/* Desktop Version */}
        <div
          className={cn(
            componentVariants.card.elevated,
            "hidden md:block p-8 relative overflow-hidden",
          )}
          style={{
            background: `linear-gradient(to bottom right, ${colors.bg.primary}, ${colors.bg.secondary})`
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <button
            onClick={() => setIsDismissed(true)}
            className="absolute top-4 left-4 p-1 transition-colors z-10"
            style={{ color: colors.text.tertiary }}
            onMouseEnter={(e) => e.currentTarget.style.color = colors.text.secondary}
            onMouseLeave={(e) => e.currentTarget.style.color = colors.text.tertiary}
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
                    backgroundColor: colors.brand.primary + '15',
                    color: colors.brand.primary
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
                          borderWidth: '1px'
                        }}
                      >
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: colors.brand.primary + '15' }}
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
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-primary-500 to-primary-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                >
                  <Smartphone className="w-5 h-5" />
                  <span>ربط الحساب الآن</span>
                </button>
              </div>

              <div className="hidden lg:block">
                <div className="relative">
                  <div 
                    className="w-48 h-48 rounded-3xl flex items-center justify-center transform rotate-6 hover:rotate-0 transition-transform duration-500"
                    style={{
                      background: `linear-gradient(to bottom right, ${colors.brand.primary}15, ${colors.brand.primary}25)`
                    }}
                  >
                    <Smartphone className="w-24 h-24" style={{ color: colors.brand.primary }} />
                  </div>
                  <div className="absolute -top-4 -right-4 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
                    <CheckCircle2 className="w-6 h-6" />
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
