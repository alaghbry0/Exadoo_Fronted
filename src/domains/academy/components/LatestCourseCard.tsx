// src/components/academy/LatestCourseCard.tsx
import { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Star } from "lucide-react";

import SmartImage from "@/shared/components/common/SmartImage";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import { fontFamily } from "@/styles/tokens";

import {
  academyCardClassNames,
  academyCardTokens,
} from "./styles/presets";

interface LatestCourseCardProps {
  id: string;
  title: string;
  lessonsCount: number;
  imageUrl: string;
  price: string;
  instructorName?: string;
  rating?: number;
  priority?: boolean;
}

const formatPrice = (value: string) => {
  if (!value) return "";
  const n = Number(value);
  return Number.isNaN(n) ? value : `${n.toFixed(0)} USDT`;
};

const MotionCard = motion(Card);

export const LatestCourseCard = memo(function LatestCourseCard({
  id,
  title,
  lessonsCount,
  imageUrl,
  price,
  instructorName = "Instructor",
  rating = 0,
  priority,
}: LatestCourseCardProps) {
  const renderStars = () =>
    Array.from({ length: 5 }).map((_, index) => {
      const isActive = index < rating;
      const activeColor = academyCardTokens.rating.active;
      const inactiveColor = academyCardTokens.rating.inactive;

      return (
        <Star
          key={index}
          size={14}
          strokeWidth={1.5}
          color={isActive ? activeColor : inactiveColor}
          fill={isActive ? activeColor : "none"}
          aria-hidden="true"
        />
      );
    });

  return (
    <Link
      href={`/academy/course/${id}`}
      prefetch
      className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{ outlineColor: academyCardTokens.surface.focusRing }}
    >
      <MotionCard
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "h-full w-[240px] min-h-[320px] flex-shrink-0 cursor-pointer sm:w-[260px]",
          academyCardClassNames.interactive,
        )}
        style={{
          background: academyCardTokens.surface.background,
          borderColor: academyCardTokens.surface.border,
        }}
      >
        <CardHeader className="p-0">
          <div className="relative h-40 w-full">
            <SmartImage
              src={imageUrl || "/image.jpg"}
              alt={title}
              fill
              blurType="secondary"
              className="object-cover"
              sizes="(max-width: 640px) 240px, 260px"
              priority={!!priority}
              lazy={!priority}
            />
            <div
              className="absolute inset-0"
              style={{ background: academyCardTokens.overlay.image }}
            />

            <Badge
              variant="outline"
              className="absolute right-3 top-3"
              style={{
                background: academyCardTokens.badge.background,
                color: academyCardTokens.badge.foreground,
                borderColor: "transparent",
                fontFamily: fontFamily.arabic,
              }}
            >
              {lessonsCount} lessons
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col px-4 pb-0 pt-4">
          <h3
            className="mb-2 text-sm font-bold leading-tight line-clamp-2"
            style={{ color: academyCardTokens.title, fontFamily: fontFamily.arabic }}
            title={title}
          >
            {title}
          </h3>

          <p
            className="mb-3 text-xs"
            style={{ color: academyCardTokens.meta, fontFamily: fontFamily.arabic }}
          >
            {instructorName}
          </p>

          <div className="mb-3 flex items-center gap-1" aria-label={`التقييم ${rating} من 5`}>
            {renderStars()}
          </div>
        </CardContent>

        <CardFooter
          className="mt-auto flex w-full items-center justify-between px-4 pb-4 pt-3"
          style={{ borderTop: `1px solid ${academyCardTokens.surface.border}` }}
        >
          <span
            className="text-base font-bold"
            style={{ color: academyCardTokens.price }}
          >
            {formatPrice(price)}
          </span>
          <Button
            intent="secondary"
            density="icon"
            aria-label="إضافة إلى السلة"
            onClick={(event) => {
              event.preventDefault();
              // Add to cart logic placeholder
            }}
          >
            <ShoppingCart aria-hidden="true" size={18} />
          </Button>
        </CardFooter>
      </MotionCard>
    </Link>
  );
});
