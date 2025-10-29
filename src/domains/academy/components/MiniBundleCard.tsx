/**
 * Mini Bundle Card
 * بطاقة حزمة تعليمية مصغرة
 */

import React, { KeyboardEvent, MouseEvent, useCallback } from "react";
import { useRouter } from "next/router";
import { Check, RefreshCw, X } from "lucide-react";
import { motion } from "framer-motion";

import SmartImage from "@/shared/components/common/SmartImage";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import { fontFamily } from "@/styles/tokens";

import { formatPrice } from "../utils/helpers";
import {
  academyCardClassNames,
  academyCardTokens,
} from "./styles/presets";

const cardHoverVariant = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.2 },
};

interface MiniBundleCardProps {
  id: string;
  title: string;
  desc: string;
  price: string;
  img?: string;
  subCategoryId?: string | number;
  freeSessionsCount?: string | number;
  priority?: boolean;
}

const MotionCard = motion(Card);

export const MiniBundleCard: React.FC<MiniBundleCardProps> = ({
  id,
  title,
  desc,
  price,
  img,
  subCategoryId,
  freeSessionsCount,
  priority,
}) => {
  const router = useRouter();

  const navigateToBundle = useCallback(() => {
    void router.push(`/academy/bundle/${id}`);
  }, [id, router]);

  const handleCardClick = useCallback(() => {
    navigateToBundle();
  }, [navigateToBundle]);

  const handleCardKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        navigateToBundle();
      }
    },
    [navigateToBundle],
  );

  const handleCtaClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      navigateToBundle();
    },
    [navigateToBundle],
  );

  const hasAccessTo3Levels = Number(subCategoryId || 0) >= 2;
  const sessionsCount = Number(freeSessionsCount || 0);
  const hasFreeSessions = sessionsCount > 0;

  const features = [
    { text: "الوصول إلى 3 مستويات", available: hasAccessTo3Levels },
    {
      text: hasFreeSessions
        ? `${sessionsCount} استشارات مجانية`
        : "استشارات مجانية",
      available: hasFreeSessions,
    },
    { text: "لايفات اسبوعية", available: true },
  ];

  return (
    <MotionCard
      {...cardHoverVariant}
      role="link"
      tabIndex={0}
      aria-label={`عرض تفاصيل الحزمة ${title}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      className={cn(
        "h-full min-h-[320px] max-h-[320px] w-full cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        academyCardClassNames.interactive,
      )}
      style={{
        background: academyCardTokens.surface.background,
        borderColor: academyCardTokens.surface.border,
        outlineColor: academyCardTokens.surface.focusRing,
      }}
    >
        <CardHeader className="flex flex-row items-start gap-3 px-5 pb-0 pt-5" dir="rtl">
          <div
            className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full"
            style={{
              boxShadow: `0 0 0 2px ${academyCardTokens.media.ring}`,
              background: academyCardTokens.surface.background,
            }}
          >
            <SmartImage
              src={img || "/11.png"}
              alt={title}
              fill
              blurType="secondary"
              className="object-cover"
              sizes="56px"
              priority={!!priority}
              lazy={!priority}
            />
          </div>

          <div className="flex-1 min-w-0 text-right" style={{ fontFamily: fontFamily.arabic }}>
            <h3
              className="mb-2 text-sm font-bold leading-tight line-clamp-2"
              style={{ color: academyCardTokens.title }}
              title={title}
            >
              {title}
            </h3>
            <p className="text-base font-semibold" style={{ color: academyCardTokens.price }}>
              {formatPrice(price)}
            </p>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col px-5 pb-0 pt-4" dir="rtl">
          <p
            className="mb-4 text-[11px] leading-relaxed line-clamp-3"
            style={{ color: academyCardTokens.subtitle, fontFamily: fontFamily.arabic }}
          >
            {(desc || "").replace(/\\r\\n/g, " ")}
          </p>

          <div className="flex flex-col gap-2">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-xs"
                style={{
                  color: academyCardTokens.features.text,
                  fontFamily: fontFamily.arabic,
                }}
              >
                {feature.available ? (
                  <Check
                    size={16}
                    aria-hidden="true"
                    style={{ color: academyCardTokens.features.available }}
                  />
                ) : (
                  <X
                    size={16}
                    aria-hidden="true"
                    style={{ color: academyCardTokens.features.unavailable }}
                  />
                )}
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </CardContent>

        <CardFooter className="mt-auto w-full px-5 pb-5 pt-4">
          <Button
            intent="primary"
            fullWidth
            type="button"
            onClick={handleCtaClick}
            style={{ fontFamily: fontFamily.arabic }}
            aria-label={`ابدأ الحزمة ${title}`}
          >
            <span className="flex items-center justify-center gap-2">
              <RefreshCw size={16} aria-hidden="true" />
              <span>{formatPrice(price)}</span>
            </span>
          </Button>
        </CardFooter>
    </MotionCard>
  );
};
