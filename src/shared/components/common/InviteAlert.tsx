// components/InviteAlert.tsx
"use client";
import React, { type CSSProperties, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, ExternalLink, X } from "lucide-react";
import { cn } from "@/shared/utils";
import { sanitizeHtml } from "@/shared/utils/safeHtml";
import {
  colors,
  withAlpha,
  shadowClasses,
  componentRadius,
} from "@/styles/tokens";

const InviteAlert: React.FC = () => {
  const [subscriptionData, setSubscriptionData] = useState<{
    invite_link: string;
    formatted_message: string;
    timestamp: number;
  } | null>(null);
  const [visible, setVisible] = useState(false);
  const [ctaInteractive, setCtaInteractive] = useState(false);

  const bannerStyles: CSSProperties = {
    background: `color-mix(in srgb, ${colors.status.success} 75%, ${colors.text.primary} 25%)`,
    borderColor: withAlpha(colors.bg.elevated, 0.65),
    color: colors.text.inverse,
  };

  const ctaBaseBg = withAlpha(colors.status.success, 0.1);
  const ctaHoverBg = withAlpha(colors.status.success, 0.18);
  const focusRingColor = withAlpha(colors.bg.elevated, 0.85);
  const focusRingOffset = withAlpha(colors.status.success, 0.35);

  const ctaStyles: CSSProperties & {
    "--focus-ring-color": string;
    "--focus-ring-offset": string;
  } = {
    backgroundColor: ctaInteractive ? ctaHoverBg : ctaBaseBg,
    borderColor: withAlpha(colors.bg.elevated, 0.55),
    color: colors.text.inverse,
    "--focus-ring-color": focusRingColor,
    "--focus-ring-offset": focusRingOffset,
  };

  useEffect(() => {
    const handleStorageUpdate = (event: CustomEvent) => {
      setSubscriptionData(event.detail);
      setVisible(true);
      // يبقى الإشعار مرئيًا حتى النقر على الرابط أو زر الإغلاق
    };

    window.addEventListener(
      "subscription_update",
      handleStorageUpdate as EventListener,
    );

    return () => {
      window.removeEventListener(
        "subscription_update",
        handleStorageUpdate as EventListener,
      );
    };
  }, []);

  if (!subscriptionData || !visible) return null;

  return (
    <div className="fixed top-4 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 transform px-4">
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className={cn(
          "border p-4 backdrop-blur-sm",
          componentRadius.card,
          shadowClasses.card,
        )}
        style={bannerStyles}
      >
        <div className="flex items-center gap-3">
          <CheckCircle
            aria-hidden="true"
            className="h-6 w-6"
            style={{ color: colors.text.inverse }}
          />
          <div>
            <p
              className="font-medium"
              style={{ color: colors.text.inverse }}
              dangerouslySetInnerHTML={sanitizeHtml(
                subscriptionData.formatted_message,
              )}
            />
            <button
              onClick={() =>
                window.open(subscriptionData.invite_link, "_blank")
              }
              type="button"
              onMouseEnter={() => setCtaInteractive(true)}
              onMouseLeave={() => setCtaInteractive(false)}
              onFocus={() => setCtaInteractive(true)}
              onBlur={() => setCtaInteractive(false)}
              className={cn(
                "mt-3 inline-flex items-center gap-2 px-4 py-2 font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                "border",
                componentRadius.button,
                shadowClasses.button,
                "focus-visible:ring-[color:var(--focus-ring-color)] focus-visible:ring-offset-[color:var(--focus-ring-offset)]",
              )}
              style={ctaStyles}
            >
              <ExternalLink /> انقر للانضمام الآن
            </button>
          </div>
          <X
            onClick={() => setVisible(false)}
            className="h-5 w-5 cursor-pointer transition-colors"
            style={{ color: colors.text.inverse }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default InviteAlert;
