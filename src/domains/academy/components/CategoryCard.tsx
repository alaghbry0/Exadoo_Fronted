// src/components/academy/CategoryCard.tsx
import { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import SmartImage from "@/shared/components/common/SmartImage";
import { Card, CardContent, CardHeader } from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import { fontFamily } from "@/styles/tokens";

import {
  academyCardClassNames,
  academyCardTokens,
} from "./styles/presets";

interface CategoryCardProps {
  id: string;
  name: string;
  thumbnail?: string;
  priority?: boolean;
}

const MotionCard = motion(Card);

export const CategoryCard = memo(function CategoryCard({
  id,
  name,
  thumbnail,
  priority,
}: CategoryCardProps) {
  return (
    <Link
      href={`/academy/category/${id}`}
      prefetch
      className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{ outlineColor: academyCardTokens.surface.focusRing }}
    >
      <MotionCard
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "w-[160px] flex-shrink-0 cursor-pointer sm:w-[180px]",
          academyCardClassNames.interactive,
        )}
        style={{
          background: academyCardTokens.surface.background,
          borderColor: academyCardTokens.surface.border,
        }}
      >
        <CardHeader className="p-0">
          <div className="relative h-32 w-full sm:h-36">
            <SmartImage
              src={thumbnail || "/image.jpg"}
              alt={name}
              fill
              blurType="secondary"
              className="object-cover"
              sizes="(max-width: 640px) 160px, 180px"
              priority={!!priority}
              lazy={!priority}
            />
            <div
              className="absolute inset-0"
              style={{ background: academyCardTokens.overlay.image }}
            />
          </div>
        </CardHeader>

        <CardContent className="flex items-center justify-center px-3 pb-3 pt-2">
          <p
            className="truncate text-center text-xs font-bold leading-snug sm:text-sm"
            style={{ color: academyCardTokens.title, fontFamily: fontFamily.arabic }}
            title={name}
          >
            {name}
          </p>
        </CardContent>
      </MotionCard>
    </Link>
  );
});
