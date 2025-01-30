'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { FiClock, FiUser, FiStar, FiZap } from 'react-icons/fi'


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
      expiry: "12 يومًا متبقي",
      progress: 70,
      status: "نشط"
    },
    {
      id: 2,
      name: "قناة الكريبتو المميزة",
      expiry: "5 أيام متبقي",
      progress: 30,
      status: "ينتهي قريبًا"
    },
  ],
}

const Profile: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] to-white safe-area-padding">
      {/* قسم رأس الملف الشخصي */}
      <motion.div
        className="w-full bg-gradient-to-b from-[#2390f1] to-[#1a75c4] pt-8 pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="container mx-auto px-4 flex flex-col items-center">
          {/* صورة الملف مع تأثير الإطار */}
          <motion.div
            className="relative w-28 h-28 group"
            whileHover={{ scale: 1.05 }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FFD700] to-[#2390f1] rounded-full opacity-20 blur-lg group-hover:opacity-30 transition-opacity" />
            <img
              src={userData.profileImage}
              alt="Profile"
              className="rounded-full w-28 h-28 border-4 border-white shadow-xl relative z-12"
            />
          </motion.div>

          {/* معلومات المستخدم */}
          <motion.div
            className="mt-6 text-center"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
          >
            <h1 className="text-2xl font-bold text-white">{userData.name}</h1>
            <p className="text-white/90 mt-1 flex items-center justify-center gap-1">
              <FiUser className="text-sm" />
              {userData.username}
            </p>
            <p className="text-white/80 mt-2 flex items-center justify-center gap-1">
              <FiClock className="text-sm" />
              عضو منذ {userData.joinDate}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* قسم الاشتراكات */}
      <motion.div
        className="container mx-auto px-4 -mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#eff8ff] p-2 rounded-lg">
              <FiZap className="text-2xl text-[#2390f1]" />
            </div>
            <h2 className="text-xl font-bold text-[#1a202c]">الاشتراكات النشطة</h2>
          </div>

          {userData.subscriptions.length > 0 ? (
            <div className="space-y-4">
              {userData.subscriptions.map((sub) => (
                <motion.div
                  key={sub.id}
                  className="bg-[#f8fbff] rounded-xl p-4 border border-[#eff8ff]"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-[#1a202c]">{sub.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{sub.expiry}</p>
                    </div>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      sub.status === 'نشط'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {sub.status}
                    </span>
                  </div>

                  {/* شريط التقدم */}
                  <div className="relative pt-2">
                    <div className="overflow-hidden h-2 bg-gray-200 rounded-full">
                      <div
                        className="bg-gradient-to-r from-[#2390f1] to-[#1a75c4] h-2 rounded-full"
                        style={{ width: `${sub.progress}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-block bg-[#eff8ff] p-4 rounded-full mb-4">
                <FiStar className="text-3xl text-[#2390f1]" />
              </div>
              <p className="text-gray-600">لا توجد اشتراكات نشطة حالياً</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default Profile