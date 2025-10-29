"use client";

import React, { useEffect, useMemo, useState, forwardRef } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  ArrowUpRight,
  Link as LinkIcon,
  Package,
  RefreshCcw,
  Star,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Subscription, SubChannelLink } from "@/domains/subscriptions/types";
import { EmptyState } from "@/shared/components/common/EmptyState";
import { SectionHeading } from "@/shared/components/common/SectionHeading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress-custom";
import { SkeletonLoader } from "@/shared/components/ui/skeleton-loader";
import { useIntersectionObserver } from "@/shared/hooks/useIntersectionObserver";
import { cn } from "@/shared/utils";
import { animations } from "@/styles/animations";
import {
  componentRadius,
  radiusClasses,
  shadowClasses,
  colors,
  gradients,
  semanticSpacing,
  withAlpha,
} from "@/styles/tokens";
import {
  getProfileStatusTheme,
  profileLinkCardStyle,
  profileSubscriptionRootStyle,
  type ProfileStatusType,
} from "./ProfileTokens";
const MotionAccordionTrigger = motion(AccordionTrigger);
const MotionAccordionContent = motion(AccordionContent);

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

type StatusType = ProfileStatusType;

type ProgressStyle = CSSProperties & {
  "--subscription-progress-indicator"?: string;
};


export default function SubscriptionsSection({
  subscriptions,
  loadMore,
  hasMore,
  isLoadingMore,
  onRefreshClick,
  isRefreshing,
}: SubscriptionsSectionProps) {
  const router = useRouter();
  const { ref: sentinelRef, isVisible } = useIntersectionObserver({
    freezeOnceVisible: false,
  });

  useEffect(() => {
    if (isVisible && hasMore && !isLoadingMore) {
      loadMore();
    }
  }, [isVisible, hasMore, isLoadingMore, loadMore]);

  return (
    <Card
      className={cn(
        "w-full border backdrop-blur-sm transition-shadow duration-300",
        componentRadius.card,
        shadowClasses.card,
      )}
      style={profileSubscriptionRootStyle}
    >
      <CardHeader className="space-y-0">
        <div dir="rtl">
          <SectionHeading
            id="profile-subscriptions-heading"
            title="اشتراكاتي"
            icon={Package}
            action={
              <Button
                intent="ghost"
                density="compact"
                onClick={onRefreshClick}
                disabled={isRefreshing}
                aria-live="polite"
                style={{ gap: semanticSpacing.component.sm }}
              >
                <RefreshCcw
                  className={cn("h-4 w-4", isRefreshing && "animate-spin")}
                />
                {isRefreshing ? "جارٍ التحديث" : "تحديث"}
              </Button>
            }
          />
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="popLayout">
          {subscriptions.length > 0 ? (
            <motion.div
              key="subscription-list"
              layout
              className="space-y-4"
            >
              {subscriptions.map((subscription, index) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  index={index}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div key="subscriptions-empty" layout>
              <EmptyState
                icon={Star}
                title="لا توجد لديك اشتراكات"
                description="يبدو أنك لم تشترك في أي باقة بعد. تصفح باقاتنا وابدأ رحلتك في التداول!"
                action={() => (
                  <Button
                    className={cn(shadowClasses.buttonElevated)}
                    style={{
                      backgroundImage:
                        "var(--profile-subscription-primary-cta-gradient)",
                      color: "var(--profile-subscription-join-text)",
                    }}
                    onClick={() => router.push("/shop")}
                  >
                    استعراض الباقات
                  </Button>
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={sentinelRef} aria-hidden className="h-px w-full" />
        {isLoadingMore && (
          <div className="mt-4">
            <SkeletonLoader />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const SubscriptionCard = forwardRef<HTMLDivElement, {
  subscription: Subscription;
  index: number;
}>(function SubscriptionCard({ subscription, index }, ref) {
  const [channelsAccordionValue, setChannelsAccordionValue] =
    useState<string | undefined>(undefined);

  const currentStatus: StatusType =
    subscription.status === "نشط" || subscription.status === "منتهي"
      ? subscription.status
      : "unknown";
  const statusTheme = getProfileStatusTheme(currentStatus);

  const showSupportBadge =
    subscription.status === "نشط" &&
    subscription.start_date &&
    Math.ceil(
      Math.abs(new Date().getTime() - new Date(subscription.start_date).getTime()) /
        (1000 * 60 * 60 * 24),
    ) <= 3;
  const showJoinButton =
    subscription.status === "نشط" && subscription.invite_link;

  const sortedLinks = useMemo(() => {
    if (!subscription.sub_channel_links) return [];
    try {
      const parsed: SubChannelLink[] =
        typeof subscription.sub_channel_links === "string"
          ? JSON.parse(subscription.sub_channel_links)
          : Array.isArray(subscription.sub_channel_links)
            ? subscription.sub_channel_links
            : [];
      return parsed.sort(
        (a: SubChannelLink, b: SubChannelLink) =>
          calculateLinkRelevance(b) - calculateLinkRelevance(a),
      );
    } catch (error) {
      console.error("فشل في تحليل روابط القنوات الفرعية:", error);
      return [];
    }
  }, [subscription.sub_channel_links]);

  const hasSubChannels =
    subscription.status === "نشط" && sortedLinks.length > 0;

  const progressStyles = useMemo<ProgressStyle>(() => ({
    backgroundColor: withAlpha(colors.bg.secondary, 0.55),
    "--subscription-progress-indicator":
      subscription.status === "نشط"
        ? colors.brand.primary
        : colors.status.warning,
  }), [subscription.status]);

  const isChannelsOpen = channelsAccordionValue === "channels";

  return (
    <motion.div
      ref={ref}
      className="list-none"
      variants={animations.subscriptionItem}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      custom={index}
    >
      <Card
        className={cn(
          "border transition-colors duration-300",
          componentRadius.card,
          shadowClasses.card,
        )}
        style={{
          backgroundColor: withAlpha(colors.bg.elevated, 0.92),
          borderColor: withAlpha(colors.border.default, 0.85),
        }}
      >
        <CardContent className="space-y-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3
                className="font-arabic text-base font-semibold leading-tight"
                style={{ color: colors.text.primary }}
              >
                {subscription.name}
              </h3>
              <p
                className="mt-1 text-sm"
                style={{ color: colors.text.secondary }}
              >
                {subscription.expiry}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge
                variant="outline"
                className="px-3 py-1 text-xs font-medium"
                style={{
                  backgroundColor: statusTheme.background,
                  color: statusTheme.color,
                  borderColor: statusTheme.border,
                }}
              >
                {subscription.status}
              </Badge>
              {showSupportBadge && (
                <Badge
                  variant="highlight"
                  className="px-2 py-0.5 text-[10px] font-semibold"
                  style={{
                    backgroundColor: withAlpha(colors.brand.primary, 0.18),
                    color: colors.brand.primary,
                  }}
                >
                  جديد
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div
              className="flex justify-between text-xs"
              style={{ color: colors.text.secondary }}
            >
              <span>التقدم</span>
              <span>{Math.round(subscription.progress || 0)}%</span>
            </div>
            <Progress
              value={subscription.progress || 0}
              className="h-2"
              style={progressStyles}
              indicatorClassName="bg-[var(--subscription-progress-indicator)]"
            />
          </div>

          {hasSubChannels && (
            <Accordion
              type="single"
              collapsible
              value={channelsAccordionValue}
              onValueChange={setChannelsAccordionValue}
              className="border-none"
            >
              <AccordionItem value="channels" className="border-none">
                <MotionAccordionTrigger
                  whileTap={animations.subscriptionToggle.whileTap}
                  className={cn(
                    "flex w-full items-center justify-between border px-3 text-start text-sm font-semibold",
                    radiusClasses.sm,
                  )}
                  style={{
                    color: colors.brand.primary,
                    borderColor: withAlpha(colors.border.default, 0.6),
                    backgroundColor: withAlpha(
                      colors.bg.secondary,
                      isChannelsOpen ? 0.32 : 0.18,
                    ),
                  }}
                >
                  <span>القنوات الإضافية ({sortedLinks.length})</span>
                </MotionAccordionTrigger>
                <MotionAccordionContent
                  key="channels-content"
                  initial="collapsed"
                  animate={isChannelsOpen ? "open" : "collapsed"}
                  variants={animations.subscriptionAccordion}
                  className="overflow-visible"
                >
                  <motion.div
                    variants={animations.subscriptionLinkGrid}
                    className="grid grid-cols-1 gap-3 pt-3 md:grid-cols-2"
                  >
                    <AnimatePresence>
                      {sortedLinks.map((channel, linkIndex) => (
                        <motion.div
                          key={channel.link}
                          custom={linkIndex}
                          variants={animations.subscriptionLinkItem}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          layout
                        >
                          <LinkCard channel={channel} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </MotionAccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {(showJoinButton || showSupportBadge) && (
            <div
              className="flex flex-wrap items-center justify-end gap-3 border-t pt-4"
              style={{ borderColor: withAlpha(colors.border.default, 0.75) }}
            >
              {showSupportBadge && (
                <Button
                  intent="outline"
                  density="compact"
                  onClick={(event) => {
                    event.preventDefault();
                    window.open("https://t.me/ExaadoSupport", "_blank");
                  }}
                  style={{ gap: semanticSpacing.component.sm }}
                >
                  <RefreshCcw className="h-4 w-4" />
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
                    gap: semanticSpacing.component.sm,
                  }}
                >
                  <Link
                    href={subscription.invite_link!}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Zap className="h-4 w-4" />
                    الانضمام للقناة
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});

const LinkCard = ({ channel }: { channel: SubChannelLink }) => {

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
        style={profileLinkCardStyle}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center",
              radiusClasses.sm,
            )}
            style={{
              backgroundColor: "var(--profile-subscription-icon-bg)",
              color: "var(--profile-brand-primary)",
            }}
          >
            <LinkIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4

              className="font-semibold truncate"
              style={{ color: "var(--profile-text-primary)" }}

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
