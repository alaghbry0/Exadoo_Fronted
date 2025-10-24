/**
 * SubscribedView Component
 * واجهة المستخدم المشترك
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Award, Download, BookUser, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { componentVariants } from "@/components/ui/variants";
import { cn } from "@/lib/utils";
import { forexAnimations } from "../animations";
import type { MyForexSubscription } from "@/pages/api/forex";

interface SubscribedViewProps {
  sub: MyForexSubscription;
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
  
  let addresses: string[] = [];
  try {
    addresses = JSON.parse(sub.forex_addresses);
  } catch {}

  return (
    <main className="max-w-4xl mx-auto px-4 pb-24 pt-12 md:pt-20">
      <motion.div
        {...forexAnimations.fadeInUp}
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
              لوحة التحكم الخاصة بك جاهزة!
            </h1>
            <p 
              className="mt-2 text-lg"
              style={{ color: "var(--color-text-secondary)" }}
            >
              أنت مشترك في خطة "{sub.status}" ويمكنك البدء باستخدام اللوحات الآن.
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
            <div className="flex justify-between items-start">
              <p style={{ color: "var(--color-text-secondary)" }}>
                <strong>الخطة:</strong>{" "}
                <span 
                  className="text-lg font-bold capitalize"
                  style={{ color: "var(--color-primary-500)" }}
                >
                  {sub.status}
                </span>
              </p>
              <Badge
                variant="outline"
                className="py-1 px-3 text-sm font-semibold border"
                style={{
                  backgroundColor: "var(--color-success-50)",
                  color: "var(--color-success-700)",
                  borderColor: "var(--color-success-300)",
                }}
              >
                <CheckCircle2 className="w-4 h-4 ml-1.5" /> مفعّل
              </Badge>
            </div>
            
            <div 
              className="border-t pt-4 text-sm space-y-3"
              style={{ borderColor: "var(--color-border-default)" }}
            >
              <p>
                <strong>تاريخ الاشتراك:</strong> {since}
              </p>
              
              {addresses.length > 0 && (
                <div>
                  <strong className="block mb-1">
                    الحسابات المفعلة (MT4/5):
                  </strong>
                  <div className="flex flex-wrap gap-2">
                    {addresses.map((addr) => (
                      <Badge
                        key={addr}
                        variant="secondary"
                        className="font-mono"
                      >
                        {addr}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 text-center">
            <h3 
              className="text-xl font-bold"
              style={{ color: "var(--color-text-primary)" }}
            >
              ابدأ الآن
            </h3>
            <p 
              className="mt-2"
              style={{ color: "var(--color-text-secondary)" }}
            >
              حمّل اللوحة واتبع دليل التثبيت للبدء فورًا.
            </p>
            
            <div className="mt-5 grid sm:grid-cols-2 gap-3">
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
                  href={sub.download_link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="w-5 h-5 ml-2" /> تحميل اللوحة
                </a>
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                asChild
                className="rounded-xl font-semibold"
                style={{
                  borderColor: "var(--color-border-default)",
                }}
              >
                <a
                  href={sub.setup_guide_link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <BookUser className="w-5 h-5 ml-2" /> دليل التثبيت
                </a>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
};
