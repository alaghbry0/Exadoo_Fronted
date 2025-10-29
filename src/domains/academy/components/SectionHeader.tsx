import React from "react";
import Link from "next/link";

import { Badge, Button } from "@/shared/components/ui";
import { fontFamily } from "@/styles/tokens";

import { academySectionTokens } from "./styles/presets";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  actionHref?: string;
  actionIcon?: React.ReactNode;
  onActionClick?: (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) => void;
  actionPrefetch?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badge,
  icon,
  actionLabel,
  actionHref,
  actionIcon,
  onActionClick,
  actionPrefetch = true,
}) => {
  const actionContent = actionLabel ? (
    <span className="inline-flex items-center gap-2">
      {actionIcon}
      <span style={{ fontFamily: fontFamily.arabic }}>{actionLabel}</span>
    </span>
  ) : null;

  const actionNode = actionLabel
    ? actionHref
      ? (
          <Button
            intent="secondary"
            density="compact"
            asChild
            style={{ fontFamily: fontFamily.arabic }}
          >
            <Link
              href={actionHref}
              prefetch={actionPrefetch}
              onClick={onActionClick}
              className="inline-flex items-center gap-2"
            >
              {actionContent}
            </Link>
          </Button>
        )
      : (
          <Button
            intent="secondary"
            density="compact"
            style={{ fontFamily: fontFamily.arabic }}
            onClick={onActionClick}
          >
            {actionContent}
          </Button>
        )
    : null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2">
        {badge ? (
          <Badge
            variant="outline"
            style={{
              background: academySectionTokens.badge.background,
              color: academySectionTokens.badge.foreground,
              borderColor: "transparent",
              fontFamily: fontFamily.arabic,
            }}
          >
            {badge}
          </Badge>
        ) : null}

        <div className="flex items-center gap-3" style={{ fontFamily: fontFamily.arabic }}>
          {icon ? (
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{
                background: academySectionTokens.icon.background,
                color: academySectionTokens.icon.foreground,
              }}
            >
              {icon}
            </span>
          ) : null}

          <h2
            className="text-xl font-bold sm:text-2xl"
            style={{ color: academySectionTokens.title }}
          >
            {title}
          </h2>
        </div>

        {subtitle ? (
          <p
            className="text-sm"
            style={{
              color: academySectionTokens.subtitle,
              fontFamily: fontFamily.arabic,
            }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>

      {actionNode ? <div className="flex shrink-0 items-center">{actionNode}</div> : null}
    </div>
  );
};
