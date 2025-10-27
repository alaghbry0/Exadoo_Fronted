// src/features/home/components/UserHeader.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserStore } from "@/stores/zustand/userStore";
import { colors, spacing } from "@/styles/tokens";

export function UserHeader() {
  const { fullName, photoUrl } = useUserStore();
  const userName = fullName || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  const displayName =
    userName.length > 24 ? `${userName.slice(0, 24)}…` : userName;

  return (
    <div
      role="banner"
      className="sticky top-0 z-50 bg-white/85 dark:bg-neutral-900/80 supports-[backdrop-filter]:backdrop-blur-md border-b border-gray-100 dark:border-neutral-800 shadow-[0_1px_0_0_rgba(0,0,0,0.03)]"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Avatar + Text */}
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Avatar className="w-11 h-11 sm:w-12 sm:h-12 ring-1 ring-gray-200/60 dark:ring-neutral-800">
              <AvatarImage
                src={photoUrl || "/icon_user.svg"}
                alt={displayName}
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {userInitial}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <h1
                className="truncate text-base sm:text-lg font-semibold text-gray-900 dark:text-white"
                style={{ fontFamily: "var(--font-arabic)" }}
              >
                Hi, {displayName} 👋
              </h1>
              <p className="mt-0.5 text-xs sm:text-[13px] text-gray-600 dark:text-neutral-400">
                In Exaado, Your Financial Partner
              </p>
            </div>
          </div>

          {/* Right: Logo */}
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2 hover:opacity-80 transition"
              aria-hidden="true"
            >
              <img
                src="/logo.png"
                alt="Exaado Logo"
                width={35}
                height={35}
                className="object-contain opacity-90"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
