/**
 * Mini Bundle Card
 * بطاقة حزمة تعليمية مصغرة
 */

import React from "react";
import Link from "next/link";
import { Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import SmartImage from "@/shared/components/common/SmartImage";
import { formatPrice } from "../utils/helpers";
import { colors } from "@/styles/tokens";

interface MiniBundleCardProps {
  id: string;
  title: string;
  desc: string;
  price: string;
  img?: string;
  priority?: boolean;
}

export const MiniBundleCard: React.FC<MiniBundleCardProps> = ({
  id,
  title,
  desc,
  price,
  img,
  priority,
}) => {
  return (
    <Link
      href={`/academy/bundle/${id}`}
      prefetch={false}
      className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-primary-400/50 focus-visible:ring-offset-2"
      aria-label={`فتح حزمة ${title}`}
    >
      <Card
        className="relative h-full overflow-hidden rounded-3xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        style={{
          background: colors.bg.primary,
          borderColor: "rgb(251 191 36 / 0.7)",
          borderWidth: "1px",
        }}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full overflow-hidden">
          <SmartImage
            src={img || "/image.jpg"}
            alt={title}
            fill
            blurType="secondary"
            sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 60vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            priority={!!priority}
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden="true"
          />

          {/* Bundle Badge */}
          <div className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 flex items-center gap-1.5 rounded-full bg-amber-500/95 px-2.5 sm:px-3 py-0.5 sm:py-1 text-white shadow-lg backdrop-blur-sm">
            <Award className="h-3 w-3" />
            <span className="text-[10px] sm:text-[11px] font-semibold">
              حزمة مميزة
            </span>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-3 sm:p-4">
          <h3
            className="mb-1.5 sm:mb-2 line-clamp-1 text-sm sm:text-[15px] font-bold"
            style={{ color: colors.text.primary }}
          >
            {title}
          </h3>

          <p
            className="mb-3 line-clamp-2 text-[13px] sm:text-sm leading-relaxed"
            style={{ color: colors.text.secondary }}
          >
            {(desc || "").replace(/\\r\\n/g, " ")}
          </p>

          {/* Footer */}
          <div
            className="flex items-center justify-between border-t pt-2.5 sm:pt-3"
            style={{ borderColor: colors.border.default }}
          >
            <span
              className="flex items-center gap-1.5 text-[11px] sm:text-[12px]"
              style={{ color: colors.text.secondary }}
            >
              <Award className="h-3.5 w-3.5" />
              <span className="font-medium">حزمة تعليمية</span>
            </span>
            <span className="text-sm sm:text-[15px] font-extrabold text-primary-600 dark:text-primary-400">
              {formatPrice(price)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
