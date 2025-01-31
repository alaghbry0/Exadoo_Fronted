'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { FiClock, FiUser, FiStar, FiZap, FiRefreshCw } from 'react-icons/fi'
import dynamic from 'next/dynamic'
import SubscriptionModal from '../components/SubscriptionModal'

// استيراد Lottie بدون SSR
const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

type Subscription = {
  id: number
  name: string
  price: string
  description: string
  features: string[]
  animation: object
  color: string
  expiry: string
  progress: number
  status: string
}

const userData = {
  id: "123456789",
  name: "محمد أحمد",
  username: "@mohamed_trader",
  profileImage: "/profile-placeholder.jpg",
  joinDate: "يناير 2024",
  subscriptions: [
    {
      id: 1,
      name: "قناة الفوركس VIP",
      price: "5 دولار/شهر",
      description: "تحليلات حصرية وإشارات تداول فورية",
      features: [
        "إشارات تداول يومية مباشرة",
        "تحليلات فنية مفصلة",
        "تنبيهات دخول/خروج"
      ],
      animation: {}, // سيتم استبدالها بالرسوم المتحركة الفعلية
      color: '#2390f1',
      expiry: "12 يومًا متبقي",
      progress: 70,
      status: "نشط"
    },
    {
      id: 2,
      name: "قناة الكريبتو المميزة",
      price: "10 دولار/شهر",
      description: "توصيات متقدمة لسوق الكريبتو",
      features: [
        "توصيات تداول يومية",
        "تحليل السوق العميق",
        "إشعارات الصفقات الحصرية"
      ],
      animation: {}, // سيتم استبدالها بالرسوم المتحركة الفعلية
      color: '#FFD700',
      expiry: "5 أيام متبقي",
      progress: 30,
      status: "ينتهي قريبًا"
    },
  ] as Subscription[],
}

const Profile: React.FC = () => {
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)

  const handleRenew = (subscription: Subscription) => {
    setSelectedSubscription(subscription)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] to-white safe-area-padding pb-24">
      {/* قسم رأس الملف الشخصي */}
      <motion.div
        className="w-full bg-gradient-to-b from-[#2390f1] to-[#1a75c4] pt-4 pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="container mx-auto px-4 flex flex-col items-center">
          {/* صورة الملف الشخصي */}
          <motion.div
            className="relative w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden"
            whileHover={{ scale: 1.05 }}
          >
            <Image
              src={userData.profileImage}
              alt="Profile"
              width={80}
              height={80}
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FFD700]/20 to-[#2390f1]/20 backdrop-blur-[2px]" />
          </motion.div>

          {/* معلومات المستخدم */}
          <motion.div
            className="mt-3 text-center"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
          >
            <h1 className="text-lg font-bold text-white">{userData.name}</h1>
            <p className="text-white/90 mt-1 text-xs flex items-center justify-center gap-1">
              <FiUser className="text-[0.7rem]" />
              {userData.username}
            </p>
            <p className="text-white/80 mt-1 text-xs flex items-center justify-center gap-1">
              <FiClock className="text-[0.7rem]" />
              عضو منذ {userData.joinDate}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* قسم الاشتراكات */}
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

          {userData.subscriptions.length > 0 ? (
            <div className="space-y-2">
              {userData.subscriptions.map((sub) => (
                <motion.div
                  key={sub.id}
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
                        sub.status === 'نشط'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {sub.status}
                      </span>
                      <button
                        onClick={() => handleRenew(sub)}
                        className="p-1 bg-[#2390f1] text-white rounded-md hover:bg-[#1a75c4] transition-colors"
                      >
                        <FiRefreshCw className="text-xs" />
                      </button>
                    </div>
                  </div>

                  {/* شريط التقدم */}
                  <div className="mt-1.5 relative">
                    <div className="overflow-hidden h-1 bg-gray-200 rounded-full">
                      <div
                        className="bg-gradient-to-r from-[#2390f1] to-[#1a75c4] h-full rounded-full"
                        style={{ width: `${sub.progress}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-3">
              <div className="inline-block bg-[#eff8ff] p-2 rounded-full mb-1.5">
                <FiStar className="text-lg text-[#2390f1]" />
              </div>
              <p className="text-gray-600 text-xs">لا توجد اشتراكات نشطة حالياً</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* نافذة تجديد الاشتراك */}
      <SubscriptionModal
        plan={selectedSubscription}
        onClose={() => setSelectedSubscription(null)}
      />
    </div>
  )
}

export default Profile