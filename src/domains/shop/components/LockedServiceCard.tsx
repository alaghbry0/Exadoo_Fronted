import type { ReactNode } from "react";
import { Lock } from "lucide-react";

import { colors, radius, spacing } from "@/styles/tokens";
import { useUIStore } from "@/shared/state/zustand/uiStore";

interface LockedServiceCardProps {
  isLocked: boolean;
  children: ReactNode;
}

export function LockedServiceCard({ isLocked, children }: LockedServiceCardProps) {
  const { openAuthPrompt } = useUIStore();

  if (!isLocked) {
    return <>{children}</>;
  }

  const handleUnlock = () => openAuthPrompt("locked");

  return (
    <div
      style={{
        position: "relative",
        borderRadius: radius["3xl"],
      }}
    >
      <button
        type="button"
        onClick={handleUnlock}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: spacing[3],
          border: "none",
          backgroundColor: colors.bg.overlay,
          color: colors.text.inverse,
          borderRadius: radius["3xl"],
          cursor: "pointer",
          fontSize: "0.875rem",
          fontWeight: 600,
        }}
        aria-label="هذه الخدمة مقفلة. اضغط لربط حسابك."
      >
        <Lock aria-hidden="true" size={20} />
        <span>يتطلب ربط الحساب</span>
      </button>
      <div
        style={{
          pointerEvents: "none",
          filter: "grayscale(1)",
          opacity: 0.55,
          borderRadius: radius["3xl"],
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}
