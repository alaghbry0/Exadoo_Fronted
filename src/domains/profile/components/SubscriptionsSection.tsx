"use client";
import React, {
  useState,
  useCallback,
  useRef,
  forwardRef,
  useMemo,
} from "react";
import type { CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  RefreshCcw,
  Star,
  Package,
  ArrowUpRight,
  ChevronDown,
  Link as LinkIcon,
} from "lucide-react";
import { Subscription, SubChannelLink } from "@/domains/subscriptions/types";
import { cn } from "@/shared/utils";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress-custom";
import { SkeletonLoader } from "@/shared/components/common/SkeletonLoader";
import { animations } from "@/styles/animations";
import {
  colors,
  componentRadius,
  gradients,
  shadows,
  radiusClasses,
  shadowClasses,
  withAlpha,
} from "@/styles/tokens";

const calculateLinkRelevance = (link: SubChannelLink) => {
  const engagementScore = link.views ? Math.log10(link.views + 1) : 0;
  const daysSinceAccess = link.last_accessed
    ? (Date.now() - new Date(link.last_accessed).getTime()) /
      (1000 * 60 * 60 * 24)
    : Infinity;
  const recencyScore = 1 / (1 + daysSinceAccess * 0.1);
  return engagementScore * 0.7 + recencyScore * 0.3;
};

type SubscriptionsSectionProps = {
  subscriptions: Subscription[];
  loadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  onRefreshClick: () => void;
  isRefreshing: boolean;
};
type StatusType = "نشط" | "منتهي" | "unknown";

type ProgressStyle = CSSProperties & {
  "--subscription-progress-indicator"?: string;
};

type ToggleButtonStyle = CSSProperties & {
  "--subscription-toggle-hover"?: string;
};

type LinkCardStyle = CSSProperties & {
  "--link-card-icon-color"?: string;
  "--link-card-icon-hover"?: string;
};

const statusTokens: Record<
  StatusType,
  { background: string; color: string; border: string }
> = {
  نشط: {
    background: withAlpha(colors.status.success, 0.16),
    color: colors.status.success,
    border: withAlpha(colors.status.success, 0.35),
  },
  منتهي: {
    background: withAlpha(colors.status.warning, 0.18),
    color: colors.status.warning,
    border: withAlpha(colors.status.warning, 0.35),
  },
  unknown: {
    background: withAlpha(colors.bg.secondary, 0.6),
    color: colors.text.secondary,
    border: withAlpha(colors.border.default, 0.9),
  },
};

export default function SubscriptionsSection({
  subscriptions,
  loadMore,
  hasMore,
  isLoadingMore,
  onRefreshClick,
  isRefreshing,
}: SubscriptionsSectionProps) {
  const observer = useRef<IntersectionObserver | null>(null);
  const lastSubscriptionRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoadingMore, hasMore, loadMore],
  );

  return (
    <Card
      className={cn(
        "w-full border backdrop-blur-sm transition-shadow duration-300",
        componentRadius.card,
        shadowClasses.card,
      )}
      style={{
        backgroundColor: withAlpha(colors.bg.elevated, 0.75),
        borderColor: withAlpha(colors.border.default, 0.85),
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center",
              radiusClasses.sm,
            )}
            style={{
              backgroundImage: gradients.brand.primary,
              boxShadow: shadows.elevation[3],
              color: colors.text.inverse,
            }}
          >
            <Package className="h-5 w-5" />
          </div>
          <CardTitle
            className="text-xl font-bold font-arabic"
            style={{ color: colors.text.primary }}
          >
            اشتراكاتي
          </CardTitle>
        </div>
        <Button
          intent="ghost"
          density="compact"
          onClick={onRefreshClick}
          disabled={isRefreshing}
        >
          <RefreshCcw
            className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")}
          />
          {isRefreshing ? "جارٍ التحديث" : "تحديث"}
        </Button>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="popLayout">
          {subscriptions.length > 0 ? (
            <ul className="space-y-4">
              {subscriptions.map((sub, index) => (
                <div
                  ref={
                    index === subscriptions.length - 1
                      ? lastSubscriptionRef
                      : null
                  }
                  key={sub.id}
                >
                  <SubscriptionItem sub={sub} index={index} />
                </div>
              ))}
            </ul>
          ) : (
            <NoSubscriptionsMessage />
          )}
        </AnimatePresence>
        {isLoadingMore && (
          <div className="mt-4">
            <SkeletonLoader />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ✨ تعديل: 2. تحديث بطاقة الرابط بالتأثيرات الجديدة
const LinkCard = ({ channel }: { channel: SubChannelLink }) => {
  const linkStyles = React.useMemo<LinkCardStyle>(() => ({
    background: withAlpha(colors.bg.secondary, 0.65),
    borderColor: withAlpha(colors.border.default, 0.8),
    color: colors.text.primary,
    "--link-card-icon-color": colors.text.tertiary,
    "--link-card-icon-hover": colors.brand.primary,
  }), []);

  return (
    <motion.div
      layout
      whileHover={animations.subscriptionLinkCard.whileHover}
      whileTap={animations.subscriptionLinkCard.whileTap}
      transition={animations.subscriptionLinkCard.transition}
    >
      <a
        href={channel.link}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "group block border p-3 transition-all duration-300",
          componentRadius.card,
          shadowClasses.card,
        )}
        style={linkStyles}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center",
              radiusClasses.sm,
            )}
            style={{
              backgroundColor: withAlpha(colors.brand.primary, 0.12),
              color: colors.brand.primary,
            }}
          >
            <LinkIcon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4
              className="font-semibold truncate"
              style={{ color: colors.text.primary }}
            >
              {channel.name}
            </h4>
          </div>
          <ArrowUpRight
            className="h-4 w-4 text-[color:var(--link-card-icon-color)] transition-colors group-hover:text-[color:var(--link-card-icon-hover)]"
          />
        </div>
      </a>
    </motion.div>
  );
};

const SubscriptionItem = ({
  sub,
  index,
}: {
  sub: Subscription;
  index: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // تم حذف `prefetchedLinks` لأن `AnimatePresence` الجديد يعالج الأنيميشن بشكل أفضل

  const currentStatus: StatusType =
    sub.status === "نشط" || sub.status === "منتهي" ? sub.status : "unknown";
  const statusTheme = statusTokens[currentStatus];
  const showSupportButton =
    sub.status === "نشط" &&
    sub.start_date &&
    Math.ceil(
      Math.abs(new Date().getTime() - new Date(sub.start_date).getTime()) /
        (1000 * 60 * 60 * 24),
    ) <= 3;
  const showJoinButton = sub.status === "نشط" && sub.invite_link;

  const sortedLinks = useMemo(() => {
    if (!sub.sub_channel_links) return [];
    try {
      const parsed: SubChannelLink[] =
        typeof sub.sub_channel_links === "string"
          ? JSON.parse(sub.sub_channel_links)
          : Array.isArray(sub.sub_channel_links)
            ? sub.sub_channel_links
            : [];
      return parsed.sort(
        (a: SubChannelLink, b: SubChannelLink) =>
          calculateLinkRelevance(b) - calculateLinkRelevance(a),
      );
    } catch (error) {
      console.error("فشل في تحليل روابط القنوات الفرعية:", error);
      return [];
    }
  }, [sub.sub_channel_links]);

  const hasSubChannels = sub.status === "نشط" && sortedLinks.length > 0;

  const progressStyles = React.useMemo<ProgressStyle>(() => ({
    backgroundColor: withAlpha(colors.bg.secondary, 0.55),
    "--subscription-progress-indicator":
      sub.status === "نشط" ? colors.brand.primary : colors.status.warning,
  }), [sub.status]);

  const toggleStyles = React.useMemo<ToggleButtonStyle>(() => ({
    color: colors.text.primary,
    borderColor: withAlpha(colors.border.default, 0.6),
    backgroundColor: withAlpha(colors.bg.secondary, isExpanded ? 0.32 : 0.18),
    "--subscription-toggle-hover": withAlpha(colors.bg.secondary, 0.35),
  }), [isExpanded]);

  return (
    <motion.li
      className={cn(
        "p-4 border transition-colors duration-300",
        componentRadius.card,
        shadowClasses.card,
      )}
      style={{
        backgroundColor: withAlpha(colors.bg.elevated, 0.92),
        borderColor: withAlpha(colors.border.default, 0.85),
      }}
      variants={animations.subscriptionItem}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      custom={index}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-base line-clamp-1 font-arabic"
            style={{ color: colors.text.primary }}
          >
            {sub.name}
          </h3>
          <p className="mt-1 text-sm" style={{ color: colors.text.secondary }}>
            {sub.expiry}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={cn(
              "text-xs px-3 py-1 border font-medium",
              componentRadius.badge,
            )}
            style={{
              backgroundColor: statusTheme.background,
              color: statusTheme.color,
              borderColor: statusTheme.border,
            }}
          >
            {sub.status}
          </span>
          {showSupportButton && (
            <span
              className={cn(
                "text-[10px] px-2 py-0.5 font-semibold",
                componentRadius.badge,
              )}
              style={{
                backgroundColor: withAlpha(colors.brand.primary, 0.18),
                color: colors.brand.primary,
              }}
            >
              جديد
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div
          className="flex justify-between text-xs"
          style={{ color: colors.text.secondary }}
        >
          <span>التقدم</span>
          <span>{Math.round(sub.progress || 0)}%</span>
        </div>
        <Progress
          value={sub.progress || 0}
          className="h-2"
          style={progressStyles}
          indicatorClassName="bg-[var(--subscription-progress-indicator)]"
        />
      </div>

      {/* ✨ تعديل: 3. استبدال قسم القنوات بالكامل بالنسخة فائقة السلاسة */}
      {hasSubChannels && (
        <div className="mt-4">
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "w-full flex justify-between items-center p-2 text-start transition-colors duration-200 border",
              radiusClasses.sm,
              "hover:bg-[var(--subscription-toggle-hover)]",
            )}
            style={toggleStyles}
            whileTap={animations.subscriptionToggle.whileTap}
          >
            <span
              className="text-sm font-semibold"
              style={{ color: colors.brand.primary }}
            >
              القنوات الاضافيه ({sortedLinks.length})
            </span>
            <motion.div
              variants={animations.subscriptionToggleIcon}
              animate={isExpanded ? "open" : "collapsed"}
            >
              <ChevronDown
                className="h-5 w-5"
                style={{ color: colors.brand.primary }}
              />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial="collapsed"
                animate="open"
                exit="collapsed"
                variants={animations.subscriptionAccordion}
                className="overflow-hidden"
              >
                <motion.div
                  className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-3"
                  variants={animations.subscriptionLinkGrid}
                >
                  <AnimatePresence>
                    {sortedLinks.map((channel, i) => (
                      <motion.div
                        key={channel.link}
                        custom={i}
                        variants={animations.subscriptionLinkItem}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout // Smooth reordering
                      >
                        <LinkCard channel={channel} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {(showJoinButton || showSupportButton) && (
        <div
          className="mt-4 border-t pt-4 flex items-center justify-end gap-3 flex-wrap"
          style={{ borderColor: withAlpha(colors.border.default, 0.75) }}
        >
          {showSupportButton && (
            <Button
              intent="outline"
              density="compact"
              onClick={(e) => {
                e.preventDefault();
                window.open("https://t.me/ExaadoSupport", "_blank");
              }}
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              طلب دعم
            </Button>
          )}
          {showJoinButton && (
            <Button
              asChild
              density="compact"
              className={cn(shadowClasses.buttonElevated)}
              style={{
                backgroundImage: gradients.status.success,
                color: colors.text.inverse,
              }}
            >
              <a
                href={sub.invite_link!}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Zap className="w-4 h-4 ml-2" />
                الانضمام للقناة
              </a>
            </Button>
          )}
        </div>
      )}
    </motion.li>
  );
};

const NoSubscriptionsMessage = forwardRef<HTMLDivElement>((props, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-center py-10 px-4 border-2 border-dashed",
      componentRadius.card,
    )}
    style={{
      backgroundColor: withAlpha(colors.bg.secondary, 0.6),
      borderColor: withAlpha(colors.border.default, 0.75),
    }}
  >
    <div
      className={cn(
        "inline-flex items-center justify-center w-16 h-16 mb-5",
        componentRadius.card,
      )}
      style={{
        backgroundImage: gradients.brand.primary,
        boxShadow: shadows.elevation[4],
        color: colors.text.inverse,
      }}
    >
      <Star className="w-8 h-8" />
    </div>
    <h3
      className="text-lg font-bold font-arabic"
      style={{ color: colors.text.primary }}
    >
      لا توجد لديك اشتراكات
    </h3>
    <p
      className="mt-2 mb-6 max-w-xs mx-auto"
      style={{ color: colors.text.secondary }}
    >
      يبدو أنك لم تشترك في أي باقة بعد. تصفح باقاتنا وابدأ رحلتك في التداول!
    </p>
    <Button
      asChild
      className={cn(shadowClasses.buttonElevated)}
      style={{
        backgroundImage: gradients.brand.primary,
        color: colors.text.inverse,
      }}
    >
      <Link href="/shop">استعراض الباقات</Link>
    </Button>
  </div>
));
NoSubscriptionsMessage.displayName = "NoSubscriptionsMessage";
