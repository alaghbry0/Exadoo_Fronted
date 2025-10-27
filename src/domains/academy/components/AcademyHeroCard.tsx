// src/components/AcademyHeroCard.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/utils";
import {
  animations,
  radius,
  shadowClasses,
} from "@/styles/tokens";

export interface AcademyHeroCardProps {
  className?: string;
}

function AcademyHeroCard({ className }: AcademyHeroCardProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Link
      href="/academy"
      prefetch
      aria-label="الدخول إلى أكاديمية إكسادو"
      className={cn("group block", className)}
      style={{
        borderRadius: radius["3xl"],
        outline: "none",
        boxShadow: isFocused
          ? "0 0 0 4px rgba(9, 97, 245, 0.2)"
          : undefined,
        transition: `box-shadow ${animations.duration.normal} ${animations.easing.out}`,
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <Card
        dir="rtl"
        className={cn(
          shadowClasses.card,
          "relative overflow-hidden transition-transform duration-300 group-hover:-translate-y-1",
        )}
        style={{
          borderRadius: radius["3xl"],
          border: "none",
          boxShadow: "none",
        }}
      >
        {/* Background SVG */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/background_banner.svg"
            alt=""
            fill
            className="object-cover"
            style={{ borderRadius: radius["3xl"] }}
            priority
          />
        </div>

        {/* Content */}
        <CardContent className="relative font-arabic p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            {/* Text Content */}
            <div className="flex-1">
              <h2
                className="text-white font-bold text-2xl md:text-3xl lg:text-4xl mb-2"
                style={{ letterSpacing: "-0.02em" }}
              >
                Exaado Academy
              </h2>
              <p className="text-white/90 text-sm md:text-base lg:text-lg font-medium">
                Unlock Pro Trading Skills
                <br />
                with Exaado Academy 🎯
              </p>
            </div>

            {/* Logo */}
            <div className="shrink-0 relative">
              <div
                className="relative rounded-full bg-white/10 backdrop-blur-sm p-1 transition-transform duration-300 group-hover:scale-105"
                style={{
                  width: "100px",
                  height: "100px",
                  border: "3px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                <Image
                  src="/new_academy.png"
                  alt="Exaado Academy Logo"
                  width={94}
                  height={94}
                  className="rounded-full"
                  priority
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default AcademyHeroCard;
