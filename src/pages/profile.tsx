'use client';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import subscriptionAnimation from '../animations/subscription.json';

// بيانات المستخدم التجريبية
const userData = {
  id: "123456789",
  name: "محمد أحمد",
  profileImage: "/profile-placeholder.jpg", // سيتم استبداله بصورة تيليجرام لاحقًا
  joinDate: "يناير 2024",
  subscriptions: [
    {
      id: 1,
      name: "Forex VIP Channel",
      expiry: "متبقي 12 يومًا",
      status: "نشط",
    },
    {
      id: 2,
      name: "Crypto VIP Channel",
      expiry: "متبقي 5 أيام",
      status: "ينتهي قريبًا",
    },
  ],
};

const Profile: React.FC = () => {
  return (
    <div className="bg-gradient-to-b from-[#2390f1] to-[#eff8ff] min-h-screen flex flex-col items-center py-10">
      {/* Hero Section */}
      <motion.div
        className="w-full flex flex-col items-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* صورة الملف الشخصي داخل بطاقة */}
        <div className="relative w-32 h-32">
          <motion.img
            src={userData.profileImage}
            alt="Profile"
            className="rounded-full w-32 h-32 border-4 border-white shadow-lg"
            whileHover={{ scale: 1.05 }}
          />
        </div>
        {/* اسم المستخدم */}
        <h1 className="text-3xl font-semibold text-white mt-4">{userData.name}</h1>
        <p className="text-white opacity-80 mt-1">🔹 عضو منذ {userData.joinDate}</p>
      </motion.div>

      {/* قسم الاشتراكات النشطة */}
      <motion.div
        className="mt-10 w-[90%] max-w-lg bg-white rounded-lg shadow-xl p-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold text-[#1a202c] flex items-center gap-2">
          <Lottie animationData={subscriptionAnimation} className="w-8 h-8" />
          الاشتراكات النشطة
        </h2>

        {userData.subscriptions.length > 0 ? (
          <div className="mt-4 space-y-4">
            {userData.subscriptions.map((sub) => (
              <motion.div
                key={sub.id}
                className="bg-gray-100 p-4 rounded-lg shadow-md flex flex-col items-center"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-lg font-bold text-[#2390f1]">{sub.name}</p>
                <p className="text-gray-600">{sub.expiry}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 mt-4 text-center">ليس لديك أي اشتراكات نشطة.</p>
        )}
      </motion.div>
    </div>
  );
};

export default Profile;
