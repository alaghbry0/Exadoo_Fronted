// src/components/shared/IndicatorsCard.tsx
"use client";

import { ServiceCardV2 } from "./ServiceCardV2";
import { useTelegram } from "@/shared/context/TelegramContext";
import { useIndicatorsData } from "@/domains/indicators/api";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, BarChart3 } from "lucide-react";

export function IndicatorsCard({
  title,
  description,
  href,
  variant = "minimal",
}: {
  title: string;
  description: string;
  href: string;
  variant?: "minimal" | "glass" | "dark" | "compact" | "split";
}) {
  const { telegramId } = useTelegram();
  const { data, isLoading } = useIndicatorsData(telegramId || undefined);

  const lifetime = data?.subscriptions?.find(
    (p: any) => p?.duration_in_months === "0",
  );
  const priceNow = lifetime?.discounted_price ?? lifetime?.price;
  const priceOld =
    lifetime?.discounted_price && lifetime.discounted_price !== lifetime.price
      ? lifetime.price
      : undefined;
  const discount =
    priceOld && priceNow
      ? Math.round(
          ((Number(priceOld) - Number(priceNow)) / Number(priceOld)) * 100,
        )
      : null;

  const PriceSlot = (
    <div className="flex items-center gap-4">
      <div>
        <p className="text-xs text-gray-500 dark:text-neutral-400">
          خطة مدى الحياة تبدأ من
        </p>
        {isLoading ? (
          <div className="h-7 w-24 mt-1 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse text-white" />
        ) : (
          <div className="flex items-baseline gap-2">
            {priceNow && (
              <span className="text-2xl md:text-3xl font-extrabold text-primary-600 dark:text-primary-400">
                ${Number(priceNow).toFixed(0)}
              </span>
            )}
            {priceOld && (
              <span className="text-lg text-gray-400 line-through">
                ${Number(priceOld).toFixed(0)}
              </span>
            )}
            {discount !== null && (
              <span className="ml-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                خصم {discount}%
              </span>
            )}
          </div>
        )}
      </div>
      <Button density="relaxed" className="rounded-xl font-bold text-white">
        تفاصيل المؤشرات
        <ArrowLeft className="w-4 h-4 mr-2" />
      </Button>
    </div>
  );

  return (
    <ServiceCardV2
      title={title}
      description={description}
      href={href}
      icon={BarChart3}
      accent="primary"
      layout="wide"
      variant={variant}
      rightSlot={PriceSlot}
    />
  );
}
