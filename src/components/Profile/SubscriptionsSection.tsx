'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { FiZap, FiStar, FiCalendar, FiSettings } from 'react-icons/fi'
import Image from 'next/image'
import { Subscription } from '@/types'

type SubscriptionsSectionProps = {
  subscriptions: Subscription[]
}

type StatusType = 'نشط' | 'منتهي' | 'unknown'
const statusColors: Record<StatusType, { bg: string; text: string }> = {
  'نشط': { bg: 'bg-green-100', text: 'text-green-700' },
  'منتهي': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'unknown': { bg: 'bg-neutral-100', text: 'text-neutral-700' }
}

export default function SubscriptionsSection({ subscriptions }: SubscriptionsSectionProps) {
  return (
    <motion.div
      className="container mx-auto px-4 -mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-primary/10 p-3 rounded-xl shadow-inner">
            <FiZap className="text-xl text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900">
            الاشتراكات النشطة
          </h2>
        </div>

        <AnimatePresence mode="popLayout">
          {subscriptions.length > 0 ? (
            <ul className="grid gap-4">
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
  )
}

interface SubscriptionItemProps {
  sub: Subscription & { channelLogo?: string } // إضافة channelLogo كنوع اختياري
}

const SubscriptionItem = ({ sub }: SubscriptionItemProps) => {
  const status: StatusType = sub.status && statusColors[sub.status] ? sub.status : 'unknown'

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className="group bg-white rounded-xl p-4 border border-neutral-100 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="bg-primary/10 p-2 rounded-lg">
            {sub.channelLogo ? (
              <Image
                src={sub.channelLogo}
                width={40}
                height={40}
                className="w-10 h-10 rounded-lg object-cover"
                alt={sub.name}
                aria-hidden="true"
              />
            ) : (
              <div className="w-10 h-10 bg-neutral-100 rounded-lg" />
            )}
          </div>

          <div className="flex-1">
            <h3 className="font-medium text-neutral-900 text-base mb-1">
              {sub.name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-neutral-500 flex items-center">
                <FiCalendar className="mr-1" aria-hidden="true" />
                {sub.expiry}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className={`text-xs px-3 py-1 rounded-full ${statusColors[status].bg} ${statusColors[status].text}`}>
            {status !== 'unknown' ? sub.status : 'غير معروف'}
          </span>
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-neutral-50 rounded-lg"
            aria-label="إدارة الاشتراك"
          >
            <FiSettings className="text-neutral-400 w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="relative h-2 bg-neutral-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${sub.progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`absolute h-full rounded-full ${
              status === 'نشط' ? 'bg-gradient-to-r from-primary to-secondary'
              : 'bg-gradient-to-r from-neutral-400 to-neutral-500'
            }`}
          />
        </div>
      </div>
    </motion.li>
  )
}

const NoSubscriptionsMessage = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-6"
  >
    <div className="inline-block bg-primary/10 p-4 rounded-full mb-4 shadow-sm">
      <FiStar className="text-2xl text-primary" aria-hidden="true" />
    </div>
    <p className="text-neutral-600 text-sm">
      لا توجد اشتراكات نشطة حالياً
    </p>
  </motion.div>
)