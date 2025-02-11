//-ProfileHeader.tsx
'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { FiClock, FiUser } from 'react-icons/fi'
import { useState, useEffect } from 'react'

// ✅ Update prop type to accept individual props
interface ProfileHeaderProps {
    fullName?: string | null;
    username?: string | null;
    profile_photo?: string | null;
    joinDate?: string | null; // ✅ إضافة joinDate إلى Props
}


export default function ProfileHeader({ fullName, username, profile_photo, joinDate }: ProfileHeaderProps) {  // ✅ Use the new prop type
    // const defaultProfile = '/default-profile.png' // ✅ قم بتعليق أو حذف هذا السطر
    const [imageSrc, setImageSrc] = useState(profile_photo || ''); // ✅ استخدم profile_photo كقيمة أولية و '' كقيمة افتراضية

    useEffect(() => {
        if (profile_photo?.startsWith('https://api.telegram.org')) { // ✅ Use profile_photo prop
            setImageSrc(profile_photo) // ✅ Use profile_photo prop
        } else {
            setImageSrc(profile_photo || ''); // ✅ استخدم profile_photo أو سلسلة فارغة إذا لم يكن هناك صورة
        }
    }, [profile_photo]) // ✅ Use profile_photo prop

    return (
        <motion.div
            className="w-full bg-gradient-to-b from-[#2390f1] to-[#1a75c4] pt-4 pb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="container mx-auto px-4 flex flex-col items-center">
                <motion.div
                    className="relative w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                >
                    <Image
                        src={imageSrc || '/logo-288.png'} // ✅ استخدم imageSrc أو شعار افتراضي بدلاً من defaultProfile
                        alt="Profile"
                        width={80}
                        height={80}
                        className="object-cover rounded-full"
                        priority
                        unoptimized // ✅ إضافة هذه الخاصية
                        onError={() => setImageSrc('/logo-288.png')} // ✅ في حالة الخطأ، استخدم الشعار الافتراضي
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#FFD700]/20 to-[#2390f1]/20 backdrop-blur-[2px]" />
                </motion.div>

                <motion.div className="mt-3 text-center" initial={{ y: 20 }} animate={{ y: 0 }}>
                    <h1 className="text-lg font-bold text-white">
                        {fullName || 'N/L'}  {/* ✅ Use fullName prop */}
                    </h1>
                    <p className="text-white/90 mt-1 text-xs flex items-center justify-center gap-1">
                        <FiUser className="text-[0.7rem]" />
                        {username ? `${username}` : 'N/L'} {/* ✅ Use username prop */}
                    </p>
                    <p className="text-white/80 mt-1 text-xs flex items-center justify-center gap-1">
                            <FiClock className="text-[0.7rem]" />
                            عضو منذ {joinDate || 'N/L'} {/* ✅ استخدام خاصية joinDate هنا */}
                        </p>
                </motion.div>
            </div>
        </motion.div>
    )
}