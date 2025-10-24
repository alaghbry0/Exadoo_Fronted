/**
 * SubscribedView Component
 * واجهة المستخدم المشترك
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Award, BarChart3, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { componentVariants } from "@/components/ui/variants";
import { cn } from "@/lib/utils";
import { indicatorsAnimations } from "../animations";
import type { IndicatorsData } from "@/pages/api/indicators";

interface SubscribedViewProps {
  sub: NonNullable<IndicatorsData["my_subscription"]>;
}

export const SubscribedView: React.FC<SubscribedViewProps> = ({ sub }) => {
  const since = useMemo(
    () =>
      new Date(Number(sub.date_added) * 1000).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [sub.date_added],
  );
  
  const isLifetime = sub.status === "lifetime";

  return (
    <main className="max-w-4xl mx-auto px-4 pb-24 pt-12 md:pt-20">
      <motion.div
        {...indicatorsAnimations.fadeInUp}
        className="relative rounded-3xl p-8 shadow-2xl overflow-hidden border-2"
        style={{
          background: "linear-gradient(to bottom right, var(--color-primary-50), var(--color-bg-elevated), rgba(var(--color-secondary-50-rgb, 251, 146, 60), 0.5))",
          borderColor: "var(--color-primary-500)",
        }}
      >
        {/* Background decorations */}
        <div 
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(var(--color-primary-400-rgb, 96, 165, 250), 0.1)" }}
        />
        <div 
          className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(var(--color-secondary-400-rgb, 251, 146, 60), 0.1)" }}
        />

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-full shadow-lg mb-4"
              style={{
                background: "linear-gradient(to bottom right, var(--color-success-500), var(--color-success-600))",
                color: "white",
              }}
            >
              <Award className="w-9 h-9" />
            </div>
            <h1 
              className="text-3xl md:text-4xl font-extrabold font-display"
              style={{ color: "var(--color-text-primary)" }}
            >
              تهانينا، أنت مشترك!
            </h1>
            <p 
              className="mt-2 text-lg"
              style={{ color: "var(--color-text-secondary)" }}
            >
              لديك وصول كامل ومفعّل لحزمة مؤشرات Exaado.
            </p>
          </div>

          {/* Subscription Info Card */}
          <div
            className={cn(
              componentVariants.card.base,
              "backdrop-blur-md p-6 space-y-4",
            )}
            style={{
              backgroundColor: "rgba(var(--color-bg-elevated-rgb, 255, 255, 255), 0.6)",
            }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p 
                  className="text-sm mb-1"
                  style={{ color: "var(--color-text-disabled)" }}
                >
                  خطتك الحالية
                </p>
                <h3 
                  className="text-2xl font-bold capitalize"
                  style={{ color: "var(--color-primary-500)" }}
                >
                  {isLifetime ? "مدى الحياة" : sub.status}
                </h3>
              </div>
              <Badge
                variant="outline"
                className="py-1 px-3 text-sm font-semibold border"
                style={{
                  backgroundColor: "var(--color-success-50)",
                  color: "var(--color-success-700)",
                  borderColor: "var(--color-success-300)",
                }}
              >
                <CheckCircle2 className="w-4 h-4 ml-1.5" />
                مفعّل
              </Badge>
            </div>
            
            <div 
              className="border-t pt-4 text-sm space-y-2"
              style={{ borderColor: "var(--color-border-default)" }}
            >
              <div className="flex justify-between">
                <strong style={{ color: "var(--color-text-primary)" }}>
                  تاريخ الاشتراك:
                </strong>
                <span>{since}</span>
              </div>
              <div className="flex justify-between">
                <strong style={{ color: "var(--color-text-primary)" }}>
                  معرّف TradingView:
                </strong>
                <span 
                  className="font-mono"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {sub.trading_view_id || "لم يتم إضافته"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 text-center">
            <h3 
              className="text-xl font-bold"
              style={{ color: "var(--color-text-primary)" }}
            >
              الخطوات التالية
            </h3>
            <p 
              className="mt-2 max-w-lg mx-auto"
              style={{ color: "var(--color-text-secondary)" }}
            >
              افتح TradingView، اذهب إلى قسم المؤشرات، وستجد الحزمة في قائمة
              "Invite-only scripts".
            </p>
            
            <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                asChild
                className="rounded-xl font-bold shadow-lg transition-transform hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(to right, var(--color-primary-500), var(--color-primary-700))",
                  color: "white",
                }}
              >
                <a
                  href="https://www.tradingview.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <BarChart3 className="w-5 h-5 ml-2" />
                  افتح TradingView
                </a>
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl font-semibold"
                style={{
                  borderColor: "var(--color-border-default)",
                }}
              >
                تواصل مع الدعم
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
};
