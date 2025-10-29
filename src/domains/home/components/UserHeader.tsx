// src/features/home/components/UserHeader.tsx
"use client";

import { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { useUserStore } from "@/shared/state/zustand/userStore";
import { cn } from "@/shared/utils";
import {
  colors,
  gradients,
  shadowClasses,
  shadows,
  withAlpha,
} from "@/styles/tokens";

type UserHeaderProps = {
  /**
   * Custom renderer for the greeting/title. Receives the formatted display name
   * and should return the full heading contents.
   */
  title?: (displayName: string) => ReactNode;
  /**
   * Optional subtitle text shown under the title. Defaults to the generic
   * Exaado tagline when not provided.
   */
  subtitle?: ReactNode;
};

export function UserHeader({ title, subtitle }: UserHeaderProps = {}) {
  const { fullName, photoUrl } = useUserStore();
  const userName = fullName || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  const displayName =
    userName.length > 24 ? `${userName.slice(0, 24)}…` : userName;

  const headingContent = title
    ? title(displayName)
    : `Hi, ${displayName} 👋`;

  const subtitleContent = subtitle ?? "In Exaado, Your Financial Partner";

  return (
    <div
      role="banner"
      className={cn(
        "sticky top-0 z-50 border-b supports-[backdrop-filter]:backdrop-blur-md backdrop-blur-md",
        shadowClasses.dropdown,
      )}
      style={{
        paddingTop: "env(safe-area-inset-top)",
        backgroundColor: withAlpha(colors.bg.elevated, 0.92),
        borderColor: withAlpha(colors.border.default, 0.7),
        boxShadow: shadows.elevation[1],
      }}
    >
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Avatar + Text */}
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Avatar
              className="h-11 w-11 sm:h-12 sm:w-12"
              style={{
                boxShadow: `0 0 0 2px ${withAlpha(colors.brand.primary, 0.2)}`,
                backgroundColor: withAlpha(colors.brand.primary, 0.08),
              }}
            >
              <AvatarImage
                src={photoUrl || "/icon_user.svg"}
                alt={displayName}
              />
              <AvatarFallback
                className="font-semibold"
                style={{
                  backgroundImage: gradients.brand.primary,
                  color: colors.text.inverse,
                  fontFamily: "var(--font-arabic)",
                }}
              >
                {userInitial}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <h1
                className="truncate text-base font-semibold sm:text-lg"
                style={{
                  fontFamily: "var(--font-arabic)",
                  color: colors.text.primary,
                }}
              >
                {headingContent}
              </h1>
              <p
                className="mt-0.5 text-xs sm:text-[13px]"
                style={{
                  color: colors.text.secondary,
                  fontFamily: "var(--font-arabic)",
                }}
              >
                {subtitleContent}
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
