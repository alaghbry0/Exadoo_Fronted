// src/components/SubscriptionPlanCard.tsx

import React, { useState } from "react"; // إضافة: استيراد `useState`
import { motion } from "framer-motion";
import { cn } from "@/shared/utils";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { ArrowLeft, Crown } from "lucide-react";
import {
  colors,
  componentRadius,
  gradients,
  shadowClasses,
  withAlpha,
} from "@/styles/tokens";

import type { SubscriptionCard, SubscriptionOption } from "@/domains/subscriptions/types";

interface SubscriptionPlanCardProps {
  cardData: SubscriptionCard;
  // تم حذف `selectedOption` و `onOptionChange`
  onSubscribeClick: (selectedOption: SubscriptionOption) => void; // تعديل: الدالة الآن تستقبل الخيار المحدد
  index: number;
}

export const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({
  cardData,
  onSubscribeClick,
  index,
}) => {
  const CardIcon = cardData.icon;

  // 🔄 إضافة: حالة داخلية لتتبع الخيار (المدة) المحدد داخل البطاقة
  // يتم تعيين القيمة الافتراضية لأول خيار متاح في القائمة
  const [selectedOption, setSelectedOption] = useState<SubscriptionOption>(
    cardData.subscriptionOptions[0],
  );

  // في حال عدم وجود خيارات، لا تعرض البطاقة (حماية إضافية)
  if (!selectedOption) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.1,
        type: "spring",
        stiffness: 200,
        damping: 25,
      }}
    >
      <Card
        className={cn(
          "h-full flex flex-col text-center backdrop-blur-sm transition-all duration-300 group",
          componentRadius.card,
          "border",
          shadowClasses.cardHover,
          cardData.isRecommended && `ring-2 ring-[${colors.brand.primary}]`,
        )}
        style={{
          background: gradients.surface.elevated,
          borderColor: withAlpha(colors.border.default, 0.65),
        }}
      >
        <CardHeader className="flex flex-col items-center pt-8">
          {cardData.isRecommended && (
            <Badge
              variant="highlight"
              className="absolute top-4 right-4 px-2 py-1 text-xs font-bold"
              style={{
                background: gradients.accent.amber,
                color: colors.text.inverse,
              }}
            >
              <Crown className="w-3.5 h-3.5 ml-1" /> موصى به
            </Badge>
          )}
          <div
            className={cn(
              "relative w-16 h-16 flex items-center justify-center mb-5 transition-transform duration-300",
              componentRadius.card,
              shadowClasses.buttonElevated,
              "group-hover:scale-110",
            )}
            style={{
              backgroundImage: gradients.brand.primary,
              color: colors.text.inverse,
            }}
          >
            <CardIcon className="w-8 h-8" style={{ color: colors.text.inverse }} />
          </div>
          <h3
            className={cn("text-2xl font-bold", `text-[${colors.text.primary}]`)}
          >
            {cardData.name}
          </h3>
          <p
            className={cn("text-sm h-10 px-2", `text-[${colors.text.secondary}]`)}
          >
            {cardData.tagline}
          </p>
        </CardHeader>
        <CardContent className="p-6 flex-1 flex flex-col justify-between">
          <div>
            {cardData.subscriptionOptions.length > 1 && (
              <div className="mb-6">
                <div
                  className="flex w-full p-1 rounded-full border"
                  style={{
                    background: withAlpha(colors.bg.secondary, 0.65),
                    borderColor: withAlpha(colors.border.default, 0.6),
                  }}
                >
                  {cardData.subscriptionOptions.map((option) => (
                    <button
                      key={option.id}
                      // 🔄 عند النقر، يتم تحديث الحالة الداخلية للبطاقة
                      onClick={() => setSelectedOption(option)}
                      className={cn(
                        "relative flex-1 text-xs font-semibold py-2.5 transition-colors duration-300 focus:outline-none",
                        componentRadius.badge,
                        `focus-visible:ring-2 focus-visible:ring-[${colors.border.focus}] focus-visible:ring-offset-2 focus-visible:ring-offset-[${colors.bg.primary}]`,
                      )}
                    >
                      {selectedOption.id === option.id && (
                        <motion.div
                          layoutId={`pill-switch-${cardData.id}`}
                          className={cn(
                            "absolute inset-0",
                            componentRadius.badge,
                            shadowClasses.button,
                          )}
                          style={{ background: colors.bg.primary }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                      <span
                        className={cn(
                          "relative z-10 transition-colors",
                          selectedOption.id === option.id
                            ? `text-[${colors.brand.primary}]`
                            : `text-[${colors.text.secondary}] hover:text-[${colors.text.primary}]`,
                        )}
                      >
                        {option.duration}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* 🔄 جميع البيانات الآن تُقرأ من الحالة الداخلية `selectedOption` */}
            <div className="text-center mb-6">
              <div className="flex items-baseline justify-center gap-2">
                {selectedOption.hasDiscount && selectedOption.originalPrice && (
                  <span
                    className={cn(
                      "text-xl font-medium line-through",
                      `text-[${withAlpha(colors.text.secondary, 0.6)}]`,
                    )}
                  >
                    {selectedOption.originalPrice.toFixed(0)}$
                  </span>
                )}
                <span
                  className={cn(
                    "text-4xl font-extrabold tracking-tight",
                    `text-[${colors.text.primary}]`,
                  )}
                >
                  {selectedOption.price}
                </span>
              </div>
              <span
                className={cn("text-sm", `text-[${colors.text.secondary}]`)}
              >
                / {selectedOption.duration}
              </span>
              <div className="h-6 flex items-center justify-center mt-2">
                {selectedOption.hasDiscount &&
                selectedOption.discountPercentage ? (
                  <Badge variant="destructive" className="font-bold">
                    خصم {selectedOption.discountPercentage}%
                  </Badge>
                ) : selectedOption.savings ? (
                  <Badge variant="success" className="font-semibold">
                    {selectedOption.savings}
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>

          <Button
            // 🔄 عند النقر على زر الاشتراك، يتم استدعاء الدالة من الأب مع تمرير الخيار المحدد حالياً
            onClick={() => onSubscribeClick(selectedOption)}
            density="relaxed"
            fullWidth
            className="px-8 py-3 font-semibold text-lg transition-all duration-300 transform hover:-translate-y-1"
            intentOverrides={{
              background: gradients.brand.primary,
              foreground: colors.text.inverse,
              hoverBackground: gradients.brand.primaryHover,
              hoverForeground: colors.text.inverse,
              shadow: shadowClasses.buttonElevated,
            }}
            disabled={!selectedOption}
          >
            اشترك الآن
            <ArrowLeft className="w-5 h-5 mr-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
