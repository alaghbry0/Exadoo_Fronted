'use client'
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiStar } from 'react-icons/fi';
import { Subscription } from '@/types';

type SubscriptionsSectionProps = {
  subscriptions: Subscription[]
};

// تعريف حالات الاشتراك مع تخصيص ألوان الخلفية والنص لكل حالة
type StatusType = 'نشط' | 'منتهي' | 'unknown';
const statusColors: Record<StatusType, { bg: string; text: string }> = {
  'نشط': { bg: 'bg-green-100', text: 'text-green-700' },
  'منتهي': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'unknown': { bg: 'bg-gray-100', text: 'text-gray-700' }
};

/**
 * المكون الرئيسي لعرض قسم الاشتراكات النشطة.
 * يتم تحريكه قليلاً إلى الأسفل لتجنب التلاصق مع قسم اسم المستخدم.
 */
export default function SubscriptionsSection({ subscriptions }: SubscriptionsSectionProps) {
  return (
    <motion.div
      className="container mx-auto px-4 mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-blue-100 p-3 rounded-xl shadow-inner">
            <FiZap className="text-xl md:text-2xl text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">الاشتراكات النشطة</h2>
        </div>

        <AnimatePresence mode="popLayout">
          {subscriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscriptions.map((sub) => (
                <SubscriptionItem key={sub.id} sub={sub} />
              ))}
            </div>
          ) : (
            <NoSubscriptionsMessage />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/**
 * مكون عرض عنصر اشتراك فردي مع تحسينات التصميم والمسافات.
 */
interface SubscriptionItemProps {
  sub: Subscription;
}

const SubscriptionItem = ({ sub }: SubscriptionItemProps) => {
  const currentStatus: StatusType = sub.status && statusColors[sub.status]
    ? sub.status
    : 'unknown';

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl p-4 border border-gray-100 hover:border-blue-100 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-start gap-4 mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-base mb-1">
            {sub.name}
          </h3>
          <p className="text-gray-600 text-sm">{sub.expiry}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${statusColors[currentStatus].bg} ${statusColors[currentStatus].text}`}>
          {currentStatus !== 'unknown' ? sub.status : 'غير معروف'}
        </span>
      </div>

      <div className="space-y-2">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${sub.progress}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>المتبقي:</span>
          <span>{sub.progress}%</span>
        </div>
      </div>
    </motion.li>
  );
};

/**
 * رسالة تُعرض عند عدم وجود اشتراكات نشطة.
 */
const NoSubscriptionsMessage = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-8 px-4"
  >
    <div className="inline-block bg-blue-100 p-4 rounded-full mb-4">
      <FiStar className="text-2xl text-blue-600" />
    </div>
    <p className="text-gray-600 text-base">
      لا توجد اشتراكات نشطة حالياً
    </p>
  </motion.div>
);
