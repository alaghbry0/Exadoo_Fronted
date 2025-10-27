// src/features/auth/components/AuthFab.tsx
"use client";

import React from "react";
import { useUserStore } from "@/shared/state/zustand/userStore";
import { useUIStore } from "@/shared/state/zustand/uiStore";
import UnlinkedStateBanner from "./UnlinkedStateBanner";

/**
 * هذا المكون يعرض فقط البانر التشجيعي للمستخدم غير المرتبط.
 * عند النقر، فإنه يستدعي دالة من المتجر العالمي لفتح النافذة المنبثقة.
 */
const AuthPrompt: React.FC = () => {
  const { isLinked } = useUserStore();
  const { openAuthPrompt } = useUIStore();

  // لا نعرض أي شيء إذا كان المستخدم مرتبطاً
  if (isLinked) {
    return null;
  }

  // نعرض فقط البانر، ونمرر له دالة فتح النافذة
  return <UnlinkedStateBanner onLinkClick={() => openAuthPrompt("generic")} />;
};

export default AuthPrompt;
