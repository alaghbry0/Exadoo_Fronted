/**
 * PlanCard Component
 * بطاقة عرض خطة اشتراك واحدة
 */

import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils";
import { PlanFeature } from "./PlanFeature";
import type { IndicatorsData } from "@/pages/api/indicators";

type Plan = NonNullable<IndicatorsData["subscriptions"]>[number];

interface PlanCardProps {
  plan: Plan;
}

const fmtUSD = (n?: string | number) => `$${Number(n || 0).toFixed(0)}`;

export const PlanCard: React.FC<PlanCardProps> = ({ plan }) => {
  const isLifetime = plan.duration_in_months === "0";
  const isFeatured = plan.is_featured === "1";
  const hasDiscount =
    plan.discounted_price && plan.discounted_price !== plan.price;
  const priceNow = hasDiscount ? plan.discounted_price : plan.price;
  const ctaText = isLifetime
    ? "احصل على وصول مدى الحياة"
    : `اشترك لمدة ${plan.duration_in_months} أشهر`;

  return (
    <Card
      className={cn(
        "rounded-3xl transition-all duration-300 border h-full flex flex-col",
        isFeatured
          ? "shadow-2xl"
          : "shadow-lg hover:shadow-xl hover:-translate-y-1",
      )}
      style={{
        backgroundColor: isFeatured 
          ? "var(--color-bg-elevated)" 
          : "var(--color-bg-secondary)",
        borderColor: isFeatured
          ? "rgba(var(--color-primary-500-rgb, 59, 130, 246), 0.5)"
          : "var(--color-border-default)",
      }}
    >
      <CardContent className="p-6 md:p-8 flex flex-col h-full relative">
        {isFeatured && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <Badge 
              className="rounded-full px-4 py-1.5 text-sm font-bold shadow-md border-4"
              style={{
                background: "linear-gradient(to right, var(--color-primary-500), var(--color-primary-700))",
                color: "white",
                borderColor: "var(--color-bg-elevated)",
              }}
            >
              الأكثر شيوعًا
            </Badge>
          </div>
        )}
        
        <h4 
          className="text-2xl font-bold text-center"
          style={{ color: "var(--color-text-primary)" }}
        >
          {plan.name}
        </h4>
        
        <div className="my-6 flex items-baseline justify-center gap-2">
          <span 
            className="text-5xl font-extrabold tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            {fmtUSD(priceNow)}
          </span>
          {hasDiscount && (
            <span 
              className="text-2xl line-through"
              style={{ color: "var(--color-text-disabled)" }}
            >
              {fmtUSD(plan.price)}
            </span>
          )}
        </div>
        
        <p 
          className="font-semibold text-center mb-8"
          style={{ color: "var(--color-primary-500)" }}
        >
          {isLifetime ? "دفعة واحدة — وصول مدى الحياة" : `فاتورة لمرة واحدة`}
        </p>
        
        <div className="flex-grow">
          <ul className="space-y-4 text-sm">
            <PlanFeature>وصول كامل لحزمة مؤشرات Exaado</PlanFeature>
            <PlanFeature>تحديثات مستقبلية مجانية ومستمرة</PlanFeature>
            <PlanFeature>تكامل سهل مع حساب TradingView</PlanFeature>
            <PlanFeature>دعم فني مخصص عبر تيليجرام</PlanFeature>
          </ul>
        </div>
        
        <Button
          size="lg"
          className={cn(
            "mt-8 w-full rounded-xl text-base font-bold shadow-button transition-all duration-300 transform hover:-translate-y-0.5",
          )}
          style={{
            background: isFeatured
              ? "linear-gradient(to right, var(--color-primary-500), var(--color-primary-700))"
              : "var(--color-text-primary)",
            color: "white",
          }}
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent("open-service-purchase", {
                detail: {
                  productType: "buy_indicators",
                  plan: {
                    id: plan.id,
                    name: plan.name,
                    price: plan.price,
                    discounted_price: plan.discounted_price,
                    duration_in_months: plan.duration_in_months,
                  },
                },
              }),
            );
          }}
        >
          {ctaText}
        </Button>
      </CardContent>
    </Card>
  );
};
