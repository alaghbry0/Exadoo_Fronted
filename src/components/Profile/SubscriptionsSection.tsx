'use client'
import { motion } from 'framer-motion'
import { FiZap, FiRefreshCw, FiStar } from 'react-icons/fi'
import { Subscription } from '@/types';

type SubscriptionsSectionProps = {
  subscriptions: Subscription[]
  handleRenew: (sub: Subscription) => void
}

export default function SubscriptionsSection({ subscriptions, handleRenew }: SubscriptionsSectionProps) {
  return (
    <motion.div
      className="container mx-auto px-4 -mt-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="bg-white rounded-xl shadow-sm p-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-[#eff8ff] p-1.5 rounded-lg">
            <FiZap className="text-lg text-[#2390f1]" />
          </div>
          <h2 className="text-base font-semibold text-[#1a202c]">الاشتراكات النشطة</h2>
        </div>

        {subscriptions.length > 0 ? (
          <div className="space-y-2">
            {subscriptions.map((sub) => (
              <SubscriptionItem key={sub.id} sub={sub} handleRenew={handleRenew} />
            ))}
          </div>
        ) : (
          <NoSubscriptionsMessage />
        )}
      </div>
    </motion.div>
  )
}

// ✅ تعريف النوع لـ SubscriptionItem
type SubscriptionItemProps = {
  sub: Subscription
  handleRenew: (sub: Subscription) => void
}

const SubscriptionItem = ({ sub, handleRenew }: SubscriptionItemProps) => (
  <motion.div
    className="bg-[#f8fbff] rounded-lg p-2 border border-[#eff8ff]"
    whileHover={{ y: -1 }}
  >
    <div className="flex justify-between items-start gap-1.5">
      <div className="flex-1">
        <h3 className="font-medium text-[#1a202c] text-xs">{sub.name}</h3>
        <p className="text-gray-600 text-[0.7rem] mt-0.5">{sub.expiry}</p>
      </div>

      <div className="flex items-center gap-1.5">
        <span className={`text-[0.6rem] px-1.5 py-0.5 rounded-full ${
          sub.status === 'نشط' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
        }`}>
          {sub.status}
        </span>
        <button
          onClick={() => handleRenew(sub)}
          className="p-1 bg-[#2390f1] text-white rounded-md hover:bg-[#1a75c4] transition-colors"
          aria-label="تجديد الاشتراك"
        >
          <FiRefreshCw className="text-xs" />
        </button>
      </div>
    </div>

    <div className="mt-1.5 relative">
      <div className="overflow-hidden h-1 bg-gray-200 rounded-full">
        <div
          className="bg-gradient-to-r from-[#2390f1] to-[#1a75c4] h-full rounded-full"
          style={{ width: `${sub.progress}%` }}
        />
      </div>
    </div>
  </motion.div>
)

const NoSubscriptionsMessage = () => (
  <div className="text-center py-3">
    <div className="inline-block bg-[#eff8ff] p-2 rounded-full mb-1.5">
      <FiStar className="text-lg text-[#2390f1]" />
    </div>
    <p className="text-gray-600 text-xs">لا توجد اشتراكات نشطة حالياً</p>
  </div>
)
