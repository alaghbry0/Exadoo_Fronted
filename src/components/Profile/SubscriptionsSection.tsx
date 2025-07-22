// SubscriptionsSection.tsx
'use client'
import React, { useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RefreshCcw, Star, Package } from 'lucide-react';
import { Subscription } from '@/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress-custom';
import { SkeletonLoader } from '@/components/SkeletonLoader';

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


export default function SubscriptionsSection({
  subscriptions,
  loadMore,
  hasMore,
  isLoadingMore,
  onRefreshClick,
  isRefreshing
}: SubscriptionsSectionProps) {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastSubscriptionRef = useCallback((node: HTMLDivElement) => {
    if (isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
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
              <CardTitle className="text-xl font-bold text-gray-800 font-arabic">
                اشتراكاتي
              </CardTitle>
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
                  {subscriptions.map((sub, index) => {
                    const ref = index === subscriptions.length - 1 ? lastSubscriptionRef : null;
                    return (
                      <div ref={ref} key={sub.id}>
                        <SubscriptionItem sub={sub} index={index} />
                      </div>
                    );
                  })}
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

const SubscriptionItem = ({ sub, index }: { sub: Subscription; index: number }) => {
    const currentStatus: StatusType = (sub.status === 'نشط' || sub.status === 'منتهي') ? (sub.status as StatusType) : 'unknown';
    const styles = statusStyles[currentStatus];

    // شرط إظهار زر الدعم (للاشتراكات الجديدة والنشطة)
    const showSupportButton = sub.status === 'نشط' && sub.start_date && Math.ceil(Math.abs(new Date().getTime() - new Date(sub.start_date).getTime()) / (1000 * 60 * 60 * 24)) <= 3;

    // شرط إظهار زر الانضمام
    const showJoinButton = sub.status === 'نشط' && sub.invite_link;

    // دالة التعامل مع النقر على زر الدعم
    const handleSupportClick = (e: React.MouseEvent) => {
        e.preventDefault();
        window.open('https://t.me/ExaadoSupport', '_blank', 'noopener,noreferrer');
    };

    return (
      <motion.li
        className="bg-white border border-gray-200/90 rounded-xl p-4 shadow-sm transition-all hover:border-primary-300 hover:shadow-md"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { delay: index * 0.07 } }
        }}
        initial="hidden"
        animate="visible"
        exit="hidden"
        layout
      >
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 text-base line-clamp-1 font-arabic">
              {sub.name}
            </h3>
            <p className="text-gray-500 text-sm mt-1">{sub.expiry}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={cn("text-xs px-3 py-1 rounded-full font-medium", styles.bg, styles.text, styles.border)}>
              {sub.status}
            </span>
            {showSupportButton && (
                <span className="bg-primary-100 text-primary-800 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                    جديد
                </span>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
                <span>التقدم</span>
                <span>{Math.round(sub.progress || 0)}%</span>
            </div>
            <Progress
              value={sub.progress || 0}
              className="h-2"
              indicatorClassName={sub.status === 'نشط' ? "bg-primary-500" : "bg-amber-400"}
            />
        </div>

        {(showJoinButton || showSupportButton) && (
          <div className="mt-4 border-t border-gray-200/80 pt-4 flex items-center justify-end gap-3">
            {showSupportButton && (
              <Button variant="outline" size="sm" onClick={handleSupportClick}>
                <RefreshCcw className="w-4 h-4 mr-2" />
                طلب دعم
              </Button>
            )}

            {showJoinButton && (
              <Button asChild size="sm" className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm hover:shadow-lg transition-shadow">
                  <a href={sub.invite_link} target="_blank" rel="noopener noreferrer">
                      <Zap className="w-4 h-4 mr-2" />
                      الانضمام
                  </a>
              </Button>
            )}
          </div>
        )}
      </motion.li>
    );
};

const NoSubscriptionsMessage = () => (
  <div className="text-center py-10 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-5 shadow-lg">
      <Star className="w-8 h-8 text-white" />
    </div>
    <h3 className="text-lg font-bold text-gray-800 font-arabic">لا توجد لديك اشتراكات</h3>
    <p className="text-gray-500 mt-2 mb-6 max-w-xs mx-auto">
      يبدو أنك لم تشترك في أي باقة بعد. تصفح باقاتنا وابدأ رحلتك في التداول!
    </p>
    <Button asChild className="bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-primary-500/30">
      <Link href="/shop">
        استعراض الباقات
      </Link>
    </Button>
  </div>
);
