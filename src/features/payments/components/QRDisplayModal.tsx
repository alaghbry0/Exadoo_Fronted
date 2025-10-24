// src/features/payments/components/QRDisplayModal.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";
import { cn } from "@/lib/utils";
import { componentVariants } from "@/components/ui/variants";
import { colors, spacing } from "@/styles/tokens";

interface QRDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  value: string;
}

export const QRDisplayModal: React.FC<QRDisplayModalProps> = ({
  isOpen,
  onClose,
  title,
  value,
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-[100]"
        style={{
          backgroundColor: colors.bg.overlay,
          padding: spacing[5],
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={cn(
            componentVariants.card.elevated,
            "w-full max-w-xs flex flex-col items-center",
          )}
          style={{ padding: spacing[6] }}
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 20, stiffness: 250 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3
            className="font-bold text-lg mb-5"
            style={{ color: colors.text.primary }}
          >
            {title}
          </h3>
          <div
            className="rounded-md"
            style={{
              backgroundColor: colors.bg.primary,
              padding: spacing[4],
              border: `1px solid ${colors.border.default}`,
            }}
          >
            <QRCode value={value} size={180} />
          </div>
          <p
            className="text-center text-sm mt-4"
            style={{ color: colors.text.secondary }}
          >
            امسح الرمز ضوئيًا باستخدام تطبيقك.
          </p>
          <button
            onClick={onClose}
            className="mt-5 w-full font-semibold rounded-lg transition-colors"
            style={{
              backgroundColor: colors.brand.primary,
              color: colors.text.inverse,
              padding: `${spacing[3]} ${spacing[5]}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.brand.primaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.brand.primary;
            }}
          >
            إغلاق
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
