/**
 * PlanCard Component
 * بطاقة عرض خطة اشتراك واحدة
 */

import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils";
import { PlanFeature } from "./PlanFeature";
import type { ForexSubscriptionPlan } from "@/pages/api/forex";
import { colors, gradients, withAlpha } from "@/styles/tokens";

interface PlanCardProps {
  plan: ForexSubscriptionPlan;
}

const fmtUSD = (n?: string | number | null) => `$${Number(n || 0).toFixed(0)}`;

export const PlanCard: React.FC<PlanCardProps> = ({ plan }) => {
  const isLifetime = plan.duration_in_months === "0";
  const isFree = plan.price === "0";
  const isFeatured = isLifetime && !isFree;
  const hasDiscount =
    !!plan.discounted_price && plan.discounted_price !== plan.price;
  const priceNow = hasDiscount ? plan.discounted_price : plan.price;

  let ctaText = "اشترك الآن";
  if (isFree) ctaText = "ابدأ التجربة المجانية";
  else if (isLifetime) ctaText = "احصل على وصول مدى الحياة";

    return (
      <Card
        className={cn(
          "rounded-3xl transition-all duration-300 border h-full flex flex-col",
          isFeatured
            ? "shadow-2xl"
            : "shadow-lg hover:shadow-xl hover:-translate-y-1",
        )}
        style={{
          backgroundColor: isFeatured ? colors.bg.elevated : colors.bg.secondary,
          borderColor: isFeatured
            ? withAlpha(colors.brand.primary, 0.5)
            : colors.border.default,
        }}
      >
      <CardContent className="p-6 md:p-8 flex flex-col h-full relative">
        {isFeatured && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge
                className="rounded-full px-4 py-1.5 text-sm font-bold shadow-md border-4"
                style={{
                  background: gradients.brand.cta,
                  color: colors.text.inverse,
                  borderColor: colors.bg.elevated,
                }}
              >
              أفضل قيمة
            </Badge>
          </div>
        )}
        
          <h4
            className="text-2xl font-bold text-center"
            style={{ color: colors.text.primary }}
          >
          {plan.name}
        </h4>
        
        <div className="my-6 flex items-baseline justify-center gap-2">
          {isFree ? (
              <span
                className="text-5xl font-extrabold tracking-tight"
                style={{ color: colors.status.success }}
              >
              مجاني
            </span>
          ) : (
            <>
                <span
                  className="text-5xl font-extrabold tracking-tight"
                  style={{ color: colors.text.primary }}
                >
                {fmtUSD(priceNow)}
              </span>
              {hasDiscount && (
                  <span
                    className="text-2xl line-through"
                    style={{ color: colors.text.disabled }}
                  >
                  {fmtUSD(plan.price)}
                </span>
              )}
            </>
          )}
        </div>
        
          <p
            className="font-semibold text-center mb-8"
            style={{ color: colors.brand.primary }}
          >
          {isFree
            ? "ابدأ تجربتك الآن"
            : isLifetime
              ? "دفعة واحدة — وصول مدى الحياة"
              : `فاتورة لمرة واحدة`}
        </p>
        
        <div className="flex-grow">
          <ul className="space-y-4 text-sm">
            <PlanFeature>
              {isFree ? "المزايا الأساسية للوحة" : "وصول كامل للوحات التداول"}
            </PlanFeature>
            <PlanFeature>تنفيذ فوري للصفقات بنقرة واحدة</PlanFeature>
            <PlanFeature>إدارة متقدمة للمخاطر</PlanFeature>
            <PlanFeature>دعم فني مخصص عبر تيليجرام</PlanFeature>
          </ul>
        </div>
        
          <Button
            density="relaxed"
            className={cn(
              "mt-8 w-full rounded-xl text-base font-bold shadow-button transition-all duration-300 transform hover:-translate-y-0.5",
            )}
            style={{
              background: isFeatured ? gradients.brand.cta : colors.text.primary,
              color: colors.text.inverse,
            }}
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent("open-service-purchase", {
                detail: { productType: "utility_trading_panel", plan },
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
