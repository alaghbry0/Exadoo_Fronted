'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { FiClock, FiUser } from 'react-icons/fi'
import { useState, useEffect } from 'react'

type UserProfile = {
  full_name?: string
  username?: string | null
  profile_photo?: string
  join_date?: string
}

export default function ProfileHeader({ userData }: { userData: UserProfile }) {
  const defaultProfile = '/default-profile.png'
  const [imageSrc, setImageSrc] = useState<string>(defaultProfile)

  useEffect(() => {
    const telegramPhoto = userData.profile_photo?.startsWith('https://api.telegram.org')
    setImageSrc(telegramPhoto ? userData.profile_photo : defaultProfile)
  }, [userData.profile_photo])

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
            src={imageSrc}
            alt="Profile"
            width={80}
            height={80}
            className="object-cover rounded-full"
            priority
            unoptimized // حل مؤقت للصور الخارجية
            onError={() => setImageSrc(defaultProfile)}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#FFD700]/20 to-[#2390f1]/20 backdrop-blur-[2px]" />
        </motion.div>

        <motion.div className="mt-3 text-center" initial={{ y: 20 }} animate={{ y: 0 }}>
          <h1 className="text-lg font-bold text-white">
            {userData.full_name || 'N/L'}
          </h1>
          <p className="text-white/90 mt-1 text-xs flex items-center justify-center gap-1">
            <FiUser className="text-[0.7rem]" />
            {userData.username ? `${userData.username}` : 'N/L'}
          </p>
          <p className="text-white/80 mt-1 text-xs flex items-center justify-center gap-1">
            <FiClock className="text-[0.7rem]" />
            عضو منذ {userData.join_date || 'N/L'}
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}