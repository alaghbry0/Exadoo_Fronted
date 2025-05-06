'use client'
import React, { useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RefreshCcw, Star } from 'lucide-react';
import { Subscription } from '@/types';
import { cn } from '@/lib/utils';
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
const statusColors: Record<StatusType, { bg: string; text: string; border: string }> = {
  'نشط': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' },
  'منتهي': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
  'unknown': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-100' }
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
    <div className="bg-white rounded-2xl shadow-sm p-5 mt-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-50 p-2 rounded-lg">
          <Zap className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-base font-semibold text-gray-800">الاشتراكات النشطة</h2>
        <motion.button
          onClick={onRefreshClick}
          disabled={isRefreshing}
          className="ml-auto text-blue-600 flex items-center text-sm font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          <RefreshCcw 
            className={`w-4 h-4 ml-1 ${isRefreshing ? 'animate-spin' : ''}`} 
          />
          {isRefreshing ? 'جاري التحديث...' : ' تحديث البيانات'}
        </motion.button>   
      </div>

      <AnimatePresence mode="popLayout">
        {subscriptions.length > 0 ? (
          <ul className="space-y-3.5">
            {subscriptions.map((sub, index) => {
              if (index === subscriptions.length - 1) {
                return (
                  <div ref={lastSubscriptionRef} key={sub.id}>
                    <SubscriptionItem sub={sub} index={index} />
                  </div>
                );
              }
              return <SubscriptionItem key={sub.id} sub={sub} index={index} />;
            })}
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
    </div>
  );
}

interface SubscriptionItemProps {
  sub: Subscription;
  index: number;
}

const SubscriptionItem = ({ sub, index }: SubscriptionItemProps) => {
  const currentStatus: StatusType = (sub.status === 'نشط' || sub.status === 'منتهي')
    ? (sub.status as StatusType)
    : 'unknown';
  const colors = statusColors[currentStatus];

  const isNewSubscription = (): boolean => {
    if (!sub.start_date || sub.status !== 'نشط') return false;
    const startDate = new Date(sub.start_date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sub.invite_link) {
      window.open(sub.invite_link, '_blank', 'noopener,noreferrer');
    }
  };

  const showJoinButton = sub.status === 'نشط' && sub.invite_link;

  const handleRefundClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open('https://t.me/ExaadoSupport', '_blank');
  };

  const showRefundButton = isNewSubscription();

  return (
    <motion.li
      className={cn(
        "rounded-lg p-4 border shadow-sm transition-all duration-200",
        "group hover:shadow-md hover:border-blue-100"
      )}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ delay: 0.5 + index * 0.1 }}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-800 text-sm line-clamp-1 mb-1 group-hover:text-blue-700">
            {sub.name}
          </h3>
          <p className="text-gray-500 text-xs line-clamp-1">{sub.expiry}</p>
        </div>
        <div>
          <span
            className={cn(
              "text-xs px-2.5 py-1 rounded-full transition-colors duration-200 inline-flex items-center",
              colors.bg,
              colors.text,
              colors.border
            )}
          >
            {currentStatus !== 'unknown' ? sub.status : 'غير معروف'}
          </span>
        </div>
      </div>

      <div className="mt-3">
        <Progress
          value={sub.progress || 0}
          className={cn(
            "h-2",
            sub.status === 'نشط' ? "bg-gray-100" : "bg-gray-50"
          )}
          indicatorClassName={cn(
            sub.status === 'نشط'
              ? "bg-gradient-to-r from-blue-400 to-blue-600"
              : "bg-orange-300"
          )}
        />
      </div>

      {showJoinButton && (
        <div className="mt-3 flex justify-end gap-2">
          <motion.a
            href={sub.invite_link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleJoinClick}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + index * 0.1 + 0.3 }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors",
              "bg-green-50 text-green-700 hover:bg-green-100 ring-1 ring-green-200"
            )}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Zap className="w-3.5 h-3.5" />
            الانضمام
          </motion.a>
        </div>
      )}

      {showRefundButton && (
        <div className="mt-3 flex justify-end">
          <motion.button
            onClick={handleRefundClick}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + index * 0.1 + 0.3 }}
            className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded text-xs font-medium hover:bg-red-100 transition-colors ring-1 ring-red-200"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            استرداد
          </motion.button>
        </div>
      )}
    </motion.li>
  );
};

const NoSubscriptionsMessage = () => (
  <div className="text-center py-8">
    <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-full mb-4 shadow-sm">
      <Star className="w-6 h-6 text-blue-500" />
    </div>
    <p className="text-gray-600 text-sm">لا توجد اشتراكات نشطة حالياً</p>
    <p className="text-gray-400 text-xs mt-2">
      يمكنك الاشتراك في أحد باقاتنا للوصول إلى المحتوى المميز
    </p>
  </div>
);
