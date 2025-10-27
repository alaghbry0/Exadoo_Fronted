/**
 * SubscriptionCard Component
 * بطاقة عرض خطة الاشتراك الحالية
 */

import { motion } from "framer-motion";
import { Calendar, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { componentVariants } from "@/shared/components/ui/variants";
import { cn } from "@/shared/utils";
import { animations } from "@/styles/animations";
import Image from "next/image";

interface SubscriptionCardProps {
  planName: string;
  planStatus: string;
  startDate: string;
  tradingViewId?: string;
  icon?: string;
  index?: number;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  planName,
  planStatus,
  startDate,
  tradingViewId,
  icon = "/indicator.png",
  index = 0,
}) => {
  return (
    <motion.div {...animations.staggeredFadeIn(index)}>
      <Card
        className={cn(
          componentVariants.card.base,
          "border-2 transition-all duration-300",
        )}
        style={{
          borderColor: "var(--color-border-default)",
          backgroundColor: "var(--color-bg-elevated)",
        }}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-purple-200 flex items-center justify-center"
              
            >
              <Image
                src={icon}
                alt={planName}
                width={55}
                height={55}
                className="object-contain"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p
                    className="text-sm mb-1"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Current Plan :
                  </p>
                  <h3
                    className="text-xl font-bold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {planName}
                  </h3>
                  <p
                    className="text-sm mt-0.5"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {planStatus}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="py-1 px-3 text-xs font-semibold border flex-shrink-0"
                  style={{
                    backgroundColor: "var(--color-success-50)",
                    color: "var(--color-success-700)",
                    borderColor: "var(--color-success-300)",
                  }}
                >
                  <CheckCircle2 className="w-3 h-3 ml-1" aria-hidden="true" />
                  Active
                </Badge>
              </div>

              <div
                className="flex items-center gap-2 text-sm pt-3 border-t"
                style={{
                  borderColor: "var(--color-border-default)",
                  color: "var(--color-text-secondary)",
                }}
              >
                <Calendar className="w-4 h-4" aria-hidden="true" />
                <span>Started on {startDate}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
