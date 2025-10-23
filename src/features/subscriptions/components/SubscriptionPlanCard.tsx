// src/components/SubscriptionPlanCard.tsx

import React, { useState } from "react"; // إضافة: استيراد `useState`
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown } from "lucide-react";

import type { SubscriptionCard, SubscriptionOption } from "@/typesPlan";

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
          "h-full flex flex-col border-gray-200/80 shadow-lg hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 bg-white/70 backdrop-blur-sm rounded-2xl text-center",
          cardData.isRecommended && "ring-2 ring-primary-500",
        )}
      >
        <CardHeader className="flex flex-col items-center pt-8">
          {cardData.isRecommended && (
            <Badge
              variant="secondary"
              className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0 px-2 py-1 text-xs font-bold shadow-lg"
            >
              <Crown className="w-3.5 h-3.5 ml-1" /> موصى به
            </Badge>
          )}
          <div className="relative w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <CardIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{cardData.name}</h3>
          <p className="text-gray-500 text-sm h-10 px-2">{cardData.tagline}</p>
        </CardHeader>
        <CardContent className="p-6 flex-1 flex flex-col justify-between">
          <div>
            {cardData.subscriptionOptions.length > 1 && (
              <div className="mb-6">
                <div className="flex w-full bg-gray-200/70 p-1 rounded-full">
                  {cardData.subscriptionOptions.map((option) => (
                    <button
                      key={option.id}
                      // 🔄 عند النقر، يتم تحديث الحالة الداخلية للبطاقة
                      onClick={() => setSelectedOption(option)}
                      className="relative flex-1 text-xs font-semibold py-2.5 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    >
                      {selectedOption.id === option.id && (
                        <motion.div
                          layoutId={`pill-switch-${cardData.id}`}
                          className="absolute inset-0 bg-white rounded-full shadow"
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                      <span
                        className={cn("relative z-10", {
                          "text-primary-600": selectedOption.id === option.id,
                          "text-gray-600 hover:text-gray-900":
                            selectedOption.id !== option.id,
                        })}
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
                  <span className="text-xl font-medium text-gray-400 line-through">
                    {selectedOption.originalPrice.toFixed(0)}$
                  </span>
                )}
                <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
                  {selectedOption.price}
                </span>
              </div>
              <span className="text-sm text-gray-500">
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
            size="lg"
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-primary-500/30 transition-all duration-300 transform hover:-translate-y-1"
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
