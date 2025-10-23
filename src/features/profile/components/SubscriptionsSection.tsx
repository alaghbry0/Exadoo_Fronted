'use client'
import React, { useState, useCallback, useRef, forwardRef, useMemo } from 'react';
import { motion, AnimatePresence, type Transition } from 'framer-motion';
import { Zap, RefreshCcw, Star, Package, ArrowUpRight, ChevronDown, Link as LinkIcon } from 'lucide-react';
import { Subscription, SubChannelLink } from '@/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress-custom';
import { SkeletonLoader } from '@/shared/components/common/SkeletonLoader';

// ✨ تعديل: 1. إضافة إعدادات الأنيميشن الجديدة
// Advanced spring config for natural motion
const expansionSpring: Transition = {
  type: 'spring',
  damping: 25, // More resistance = less bouncy
  stiffness: 200, // Faster snap
  mass: 0.5, // Lightweight feel
};

// Staggered child animations
const linkItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05, // Cascading delay
      ...expansionSpring,
    }
  }),
  exit: { opacity: 0, y: -10 }
};

const calculateLinkRelevance = (link: SubChannelLink) => {
  const engagementScore = link.views ? Math.log10(link.views + 1) : 0;
  const daysSinceAccess = link.last_accessed
    ? (Date.now() - new Date(link.last_accessed).getTime()) / (1000 * 60 * 60 * 24)
    : Infinity;
  const recencyScore = 1 / (1 + daysSinceAccess * 0.1);
  return (engagementScore * 0.7) + (recencyScore * 0.3);
};

type SubscriptionsSectionProps = {
  subscriptions: Subscription[];
  loadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  onRefreshClick: () => void;
  isRefreshing: boolean;
};
type StatusType = 'نشط' | 'منتهي' | 'unknown';
const statusStyles: Record<StatusType, { bg: string; text: string; border: string }> = {
  'نشط': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  'منتهي': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  'unknown': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
};

export default function SubscriptionsSection({ subscriptions, loadMore, hasMore, isLoadingMore, onRefreshClick, isRefreshing }: SubscriptionsSectionProps) {
  const observer = useRef<IntersectionObserver | null>(null);
  const lastSubscriptionRef = useCallback((node: HTMLDivElement) => {
    if (isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) { loadMore(); }
    });
    if (node) observer.current.observe(node);
  }, [isLoadingMore, hasMore, loadMore]);

  return (
    <Card className="w-full shadow-lg border-gray-200/80 bg-white/70 backdrop-blur-sm rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-md">
            <Package className="w-5 h-5 text-white" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-800 font-arabic">اشتراكاتي</CardTitle>
        </div>
        <Button variant="ghost" size="sm" onClick={onRefreshClick} disabled={isRefreshing}>
          <RefreshCcw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
          {isRefreshing ? 'جارٍ التحديث' : 'تحديث'}
        </Button>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="popLayout">
          {subscriptions.length > 0 ? (
            <ul className="space-y-4">
              {subscriptions.map((sub, index) => (
                <div ref={index === subscriptions.length - 1 ? lastSubscriptionRef : null} key={sub.id}>
                  <SubscriptionItem sub={sub} index={index} />
                </div>
              ))}
            </ul>
          ) : (
            <NoSubscriptionsMessage />
          )}
        </AnimatePresence>
        {isLoadingMore && <div className="mt-4"><SkeletonLoader /></div>}
      </CardContent>
    </Card>
  );
}

// ✨ تعديل: 2. تحديث بطاقة الرابط بالتأثيرات الجديدة
const LinkCard = ({ channel }: { channel: SubChannelLink }) => {
  return (
    // تم دمج تأثيرات الحركة هنا، مع إزالة الحركة من الوسم <a> الداخلي لمنع التعارض
    <motion.div
      layout
      whileHover={{
        scale: 1.03,
        y: -3,
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
      }}
      whileTap={{
        scale: 0.97,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      }}
      transition={expansionSpring}
    >
      <a
        href={channel.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block group p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm transition-shadow duration-300 border border-gray-200 hover:border-primary-300 hover:shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center">
            <LinkIcon className="w-5 h-5 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-800 truncate">{channel.name}</h4>
          </div>
          <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
        </div>
      </a>
    </motion.div>
  );
};

const SubscriptionItem = ({ sub, index }: { sub: Subscription; index: number }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // تم حذف `prefetchedLinks` لأن `AnimatePresence` الجديد يعالج الأنيميشن بشكل أفضل

    const currentStatus: StatusType = (sub.status === 'نشط' || sub.status === 'منتهي') ? sub.status : 'unknown';
    const styles = statusStyles[currentStatus];
    const showSupportButton = sub.status === 'نشط' && sub.start_date && Math.ceil(Math.abs(new Date().getTime() - new Date(sub.start_date).getTime()) / (1000 * 60 * 60 * 24)) <= 3;
    const showJoinButton = sub.status === 'نشط' && sub.invite_link;

    const sortedLinks = useMemo(() => {
        if (!sub.sub_channel_links) return [];
        try {
            const parsed: SubChannelLink[] = typeof sub.sub_channel_links === 'string'
                ? JSON.parse(sub.sub_channel_links)
                : Array.isArray(sub.sub_channel_links) ? sub.sub_channel_links : [];
            return parsed.sort((a: SubChannelLink, b: SubChannelLink) => calculateLinkRelevance(b) - calculateLinkRelevance(a));
        } catch (error) {
            console.error("فشل في تحليل روابط القنوات الفرعية:", error);
            return [];
        }
    }, [sub.sub_channel_links]);

    const hasSubChannels = sub.status === 'نشط' && sortedLinks.length > 0;

    return (
      <motion.li
        className="bg-white border border-gray-200/90 rounded-xl p-4 shadow-sm transition-all hover:border-primary-300 hover:shadow-md"
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: index * 0.07 }}}}
        initial="hidden" animate="visible" exit="hidden" layout
      >
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 text-base line-clamp-1 font-arabic">{sub.name}</h3>
            <p className="text-gray-500 text-sm mt-1">{sub.expiry}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={cn("text-xs px-3 py-1 rounded-full font-medium", styles.bg, styles.text, styles.border)}>{sub.status}</span>
            {showSupportButton && <span className="bg-primary-100 text-primary-800 text-[10px] px-2 py-0.5 rounded-full font-semibold">جديد</span>}
          </div>
        </div>

        <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
                <span>التقدم</span>
                <span>{Math.round(sub.progress || 0)}%</span>
            </div>
            <Progress value={sub.progress || 0} className="h-2" indicatorClassName={sub.status === 'نشط' ? "bg-primary-500" : "bg-amber-400"} />
        </div>

        {/* ✨ تعديل: 3. استبدال قسم القنوات بالكامل بالنسخة فائقة السلاسة */}
        {hasSubChannels && (
          <div className="mt-4">
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex justify-between items-center p-2 rounded-md hover:bg-gray-100 transition-colors"
              whileTap={{ scale: 0.98 }} // Tactile feedback
            >
              <span className="text-sm font-semibold text-primary-600">
                القنوات الاضافيه ({sortedLinks.length})
              </span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={expansionSpring}
              >
                <ChevronDown className="h-5 w-5 text-primary-600" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial="collapsed"
                  animate="open"
                  exit="collapsed"
                  variants={{
                    open: {
                      height: "auto",
                      opacity: 1,
                      transition: {
                        ...expansionSpring,
                        staggerChildren: 0.05 // Stagger effect
                      }
                    },
                    collapsed: {
                      height: 0,
                      opacity: 0,
                      transition: {
                        ...expansionSpring,
                        staggerChildren: 0.02,
                        staggerDirection: -1
                      }
                    }
                  }}
                  className="overflow-hidden"
                >
                  <motion.div
                    className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-3"
                    variants={{
                      open: { transition: { staggerChildren: 0.1 }},
                      collapsed: { transition: { staggerChildren: 0.05, staggerDirection: -1 }}
                    }}
                  >
                    <AnimatePresence>
                      {sortedLinks.map((channel, i) => (
                        <motion.div
                          key={channel.link}
                          custom={i}
                          variants={linkItemVariants}
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
          <div className="mt-4 border-t border-gray-200/80 pt-4 flex items-center justify-end gap-3 flex-wrap">
            {showSupportButton && <Button variant="outline" size="sm" onClick={(e) => { e.preventDefault(); window.open('https://t.me/ExaadoSupport', '_blank'); }}><RefreshCcw className="w-4 h-4 mr-2" />طلب دعم</Button>}
            {showJoinButton && (
              <Button asChild size="sm" className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm hover:shadow-lg transition-shadow">
                  <a href={sub.invite_link!} target="_blank" rel="noopener noreferrer"><Zap className="w-4 h-4 ml-2" />الانضمام للقناة</a>
              </Button>
            )}
          </div>
        )}
      </motion.li>
    );
};

const NoSubscriptionsMessage = forwardRef<HTMLDivElement>((props, ref) => (
  <div ref={ref} className="text-center py-10 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-5 shadow-lg"><Star className="w-8 h-8 text-white" /></div>
    <h3 className="text-lg font-bold text-gray-800 font-arabic">لا توجد لديك اشتراكات</h3>
    <p className="text-gray-500 mt-2 mb-6 max-w-xs mx-auto">يبدو أنك لم تشترك في أي باقة بعد. تصفح باقاتنا وابدأ رحلتك في التداول!</p>
    <Button asChild className="bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-primary-500/30"><Link href="/shop">استعراض الباقات</Link></Button>
  </div>
));
NoSubscriptionsMessage.displayName = 'NoSubscriptionsMessage';
