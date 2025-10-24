/**
 * PricingView Component
 * واجهة عرض الأسعار والخطط
 */

import { Zap, ShieldCheck, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import AuthPrompt from "@/features/auth/components/AuthFab";
import TradingPanelPurchaseModal from "@/components/TradingPanelPurchaseModal";
import { HeroSection } from "./HeroSection";
import { FeatureCard } from "./FeatureCard";
import { PlanCard } from "./PlanCard";
import { FAQSection } from "./FAQSection";
import type { ForexData } from "@/pages/api/forex";

interface PricingViewProps {
  data: ForexData;
}

export const PricingView: React.FC<PricingViewProps> = ({ data }) => {
  // فرز الخطط لعرض خطة مدى الحياة بشكل مميز
  const plans = data.subscriptions ?? [];
  const lifetimePlan = plans.find((p) => p.duration_in_months === "0");
  const otherPlans = plans
    .filter((p) => p.duration_in_months !== "0")
    .sort((a, b) => Number(a.price) - Number(b.price));
  const allPlans = [...otherPlans, ...(lifetimePlan ? [lifetimePlan] : [])];

  const features = [
    {
      icon: Zap,
      title: "تنفيذ فوري",
      description: "فتح وإغلاق الصفقات بنقرة واحدة، أسرع من أي وقت مضى.",
    },
    {
      icon: ShieldCheck,
      title: "إدارة المخاطر",
      description: "حساب حجم اللوت تلقائيًا وتحديد وقف الخسارة والربح بسهولة.",
    },
    {
      icon: Award,
      title: "واجهة احترافية",
      description: "تصميم نظيف وسهل الاستخدام متوافق مع MT4 و MT5.",
    },
  ];

  return (
    <main className="pb-12">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-16 max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} {...feature} index={i} />
          ))}
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section
        id="plans"
        className="py-16 border-y"
        style={{
          backgroundColor: "var(--color-bg-secondary)",
          borderColor: "var(--color-border-default)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 
              className="text-3xl font-extrabold font-display"
              style={{ color: "var(--color-text-primary)" }}
            >
              اختر الخطة التي تناسبك
            </h2>
            <p 
              className="mt-2"
              style={{ color: "var(--color-text-secondary)" }}
            >
              ابدأ تجربتك المجانية أو احصل على وصول كامل اليوم.
            </p>
          </div>
          
          {allPlans.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {allPlans.map((p) => (
                <PlanCard key={p.id} plan={p} />
              ))}
            </div>
          ) : (
            <Card className="rounded-3xl border-dashed sm:col-span-3">
              <CardContent 
                className="p-8 text-center"
                style={{ color: "var(--color-text-disabled)" }}
              >
                لا توجد خطط متاحة حاليًا.
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Modals & Floating Actions */}
      <AuthPrompt />
      <TradingPanelPurchaseModal />
    </main>
  );
};
