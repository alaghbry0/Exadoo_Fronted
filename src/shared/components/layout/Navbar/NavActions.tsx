import Link from "next/link";
import { Bell } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import ThemeToggle from "@/shared/components/common/ThemeToggle";
import { cn } from "@/shared/utils";
import { colors, componentRadius, semanticSpacing } from "@/styles/tokens";

interface NavActionsProps {
  showNotifications: boolean;
  notificationCount: number;
  notificationsHref: string;
  isRTL: boolean;
}

/**
 * Navbar Actions (Theme Toggle + Notifications)
 */
export function NavActions({
  showNotifications,
  notificationCount,
  notificationsHref,
  isRTL,
}: NavActionsProps) {
  return (
    <div
      className={cn("flex items-center", isRTL && "flex-row-reverse")}
      style={{ gap: semanticSpacing.component.md }}
    >
      {/* Theme Toggle - Desktop Only */}
      <div className="hidden md:flex">
        <ThemeToggle
          showLabels={false}
          showStatusText={false}
          className="shadow-none"
        />
      </div>

      {/* Notifications Bell */}
      {showNotifications && (
        <Button intent="ghost" density="icon" className="relative" asChild>
          <Link
            href={notificationsHref}
            aria-label={`الإشعارات${notificationCount > 0 ? ` - ${notificationCount} غير مقروءة` : ""}`}
            className="flex h-full w-full items-center justify-center"
          >
            <Bell className="h-5 w-5" aria-hidden />
            {notificationCount > 0 && (
              <Badge
                variant="outline"
                className={cn(
                  "absolute flex h-5 w-5 items-center justify-center p-0 text-xs border-0 font-bold",
                  componentRadius.badge
                )}
                style={{
                  backgroundColor: colors.status.error,
                  color: colors.text.inverse,
                  top: `calc(-1 * ${semanticSpacing.component.xs})`,
                  [isRTL ? "right" : "left"]: `calc(-1 * ${semanticSpacing.component.xs})`,
                }}
              >
                {notificationCount > 9 ? "9+" : notificationCount}
              </Badge>
            )}
          </Link>
        </Button>
      )}
    </div>
  );
}
