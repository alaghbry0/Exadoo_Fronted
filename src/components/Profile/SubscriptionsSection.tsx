'use client'
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiStar } from 'react-icons/fi';
import { Subscription } from '@/types';

type SubscriptionsSectionProps = {
  subscriptions: Subscription[]
}

// تعريف الحالات الممكنة للاشتراكات مع تخصيص ألوان الخلفية والنص لكل حالة
type StatusType = 'نشط' | 'منتهي' | 'unknown';
const statusColors: Record<StatusType, { bg: string; text: string }> = {
  'نشط': { bg: 'bg-green-100', text: 'text-green-700' },
  'منتهي': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'unknown': { bg: 'bg-gray-100', text: 'text-gray-700' }
};

export default function SubscriptionsSection({ subscriptions }: SubscriptionsSectionProps) {
  return (
    <motion.div
      className="container mx-auto px-4 -mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-[#eff8ff] p-2 rounded-xl shadow-inner">
            <FiZap className="text-xl text-[#2390f1]" />
          </div>
          <h2 className="text-lg font-semibold text-[#1a202c]">
            الاشتراكات النشطة
          </h2>
        </div>

        <AnimatePresence mode="popLayout">
          {subscriptions.length > 0 ? (
            <ul className="space-y-3">
              {subscriptions.map((sub) => (
                <SubscriptionItem key={sub.id} sub={sub} />
              ))}
            </ul>
          ) : (
            <NoSubscriptionsMessage />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// مكون لعرض عنصر اشتراك فردي
interface SubscriptionItemProps {
  sub: Subscription
}

const SubscriptionItem = ({ sub }: SubscriptionItemProps) => {
  // التحقق من الحالة مع قيمة افتراضية (unknown) في حال عدم تطابق الحالة مع الألوان المعرفة
  const status: StatusType = sub.status && statusColors[sub.status]
    ? sub.status
    : 'unknown';

  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-[#f8fbff] rounded-lg p-3 border border-[#eff8ff] shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <h3 className="font-medium text-[#1a202c] text-sm mb-1">
            {sub.name}
          </h3>
          <p className="text-gray-600 text-xs opacity-90">
            {sub.expiry}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-1 rounded-full
              ${statusColors[status].bg}
              ${statusColors[status].text}`}
          >
            {status !== 'unknown' ? sub.status : 'غير معروف'}
          </span>
        </div>
      </div>

      <div className="mt-3">
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${sub.progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute h-full bg-gradient-to-r from-[#2390f1] to-[#1a75c4] rounded-full"
          />
        </div>
      </div>
    </motion.li>
  );
}

// رسالة تظهر في حال عدم وجود اشتراكات نشطة
const NoSubscriptionsMessage = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-4"
  >
    <div className="inline-block bg-[#eff8ff] p-3 rounded-full mb-3 shadow-sm">
      <FiStar className="text-2xl text-[#2390f1]" />
    </div>
    <p className="text-gray-600 text-sm">
      لا توجد اشتراكات نشطة حالياً
    </p>
  </motion.div>
);
