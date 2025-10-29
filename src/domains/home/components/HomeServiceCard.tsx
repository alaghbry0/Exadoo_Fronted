// src/features/home/components/HomeServiceCard.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { LottieAnimation } from "@/shared/components/common/LottieAnimation";
import { cn } from "@/shared/utils";
import {
  colors,
  radius,
  spacing,
  shadowClasses,
  withAlpha,
  fontFamily,
} from "@/styles/tokens";

interface HomeServiceCardProps {
  title: string;
  description: string;
  href: string;
  animationData?: any;
  icon?: LucideIcon;
  className?: string;
}

export function HomeServiceCard({
  title,
  description,
  href,
  animationData,
  icon: Icon,
  className,
}: HomeServiceCardProps) {
  const [isFocused, setIsFocused] = useState(false);

  // تحديد نوع البطاقة بناءً على العنوان
  const isSignalsCard = title.includes("Signals");
  const isForexCard = title.includes("Forex");
  const isIndicatorsCard = title.includes("Indicators");

  return (
    <Link
      href={href}
      prefetch
      aria-label={title}
      className={cn("group block", className)}
      style={{
        borderRadius: radius["2xl"],
        outline: "none",
        boxShadow: isFocused
          ? `0 0 0 4px ${withAlpha(colors.brand.primary, 0.2)}`
          : undefined,
        transition: "box-shadow 0.2s ease-out",
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <Card
        dir="rtl"
        className={cn(
          shadowClasses.card,
          "relative overflow-hidden transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-xl",
        )}
        style={{
          borderRadius: radius["2xl"],
          backgroundColor: colors.bg.elevated,
          border: `1px solid ${colors.border.default}`,
        }}
      >
        <CardContent className="relative font-arabic p-6">
          {/* Animation Container with Enhanced Styling */}
          <div
            className="flex items-center justify-center mb-4 relative"
            style={{ height: "140px" }}
          >
            {animationData ? (
              <div className="relative">
                {/* Enhanced Animation Size */}
                <LottieAnimation
                  animationData={animationData}
                  width="80px"
                  height="80px"
                  className="z-10 relative"
                  frameStyle={{
                    backgroundColor: colors.bg.elevated,
                  }}
                />
                
                {/* Special Effects for Signals Card */}
                {isSignalsCard && (
                  <>
                    {/* Red Glow Effect */}
                    <div
                      className="absolute inset-0 rounded-full opacity-30 animate-pulse"
                      style={{
                        background: `radial-gradient(circle, ${withAlpha(colors.status.error, 0.4)} 0%, ${withAlpha(colors.status.error, 0.1)} 50%, transparent 100%)`,
                        width: "120px",
                        height: "120px",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 1,
                      }}
                    />
                    {/* Additional Glow Layer */}
                    <div
                      className="absolute inset-0 rounded-full opacity-20"
                      style={{
                        background: `radial-gradient(circle, ${withAlpha(colors.status.error, 0.6)} 0%, ${withAlpha(colors.status.error, 0.2)} 40%, transparent 80%)`,
                        width: "160px",
                        height: "160px",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 0,
                      }}
                    />
                  </>
                )}
                
                {/* Special Effects for Forex Card */}
                {isForexCard && (
                  <div
                    className="absolute inset-0 rounded-full opacity-10"
                    style={{
                      background: `radial-gradient(circle, ${withAlpha(colors.brand.primary, 0.3)} 0%, ${withAlpha(colors.brand.primary, 0.1)} 50%, transparent 100%)`,
                      width: "100px",
                      height: "100px",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      zIndex: 1,
                    }}
                  />
                )}
              </div>
            ) : Icon ? (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: withAlpha(colors.brand.primary, 0.08),
                }}
              >
                <Icon
                  className="w-10 h-10"
                  style={{ color: colors.brand.primary }}
                />
              </div>
            ) : null}
          </div>

          {/* Content */}
          <div className="text-center">
            <h3
              className="text-xl font-bold mb-2"
              style={{
                color: colors.text.primary,
                fontFamily: fontFamily.arabic,
              }}
            >
              {title}
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{
                color: colors.text.secondary,
                fontFamily: fontFamily.arabic,
              }}
            >
              {description}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
