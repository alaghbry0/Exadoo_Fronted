'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { FiClock, FiUser } from 'react-icons/fi'
import { useMemo } from 'react'

export function getValidPhotoUrl(url: string | null, defaultAvatar: string): string {
  if (!url) return defaultAvatar
  try {
    if (url.startsWith('https://')) {
      new URL(url)
      return url
    }
  } catch (error) {
    console.error('Invalid photo URL:', error)
  }
  return defaultAvatar
}

interface ProfileHeaderProps {
  fullName?: string | null
  username?: string | null
  profilePhoto?: string | null
  joinDate?: string | null
}

const DEFAULT_AVATAR = '/logo-288.png'

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}

export default function ProfileHeader({
  fullName = 'مستخدم بدون اسم',
  username = 'بدون معرف',
  profilePhoto,
  joinDate
}: ProfileHeaderProps) {
  const formattedJoinDate = useMemo(() => {
    if (!joinDate) return 'غير معروف'
    try {
      return new Date(joinDate).toLocaleDateString('ar-EG', DATE_OPTIONS)
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'تاريخ غير صالح'
    }
  }, [joinDate])

  const avatarSrc = useMemo(
    () => getValidPhotoUrl(profilePhoto ?? null, DEFAULT_AVATAR),
    [profilePhoto]
  )

  return (
    <motion.div
      className="w-full bg-gradient-to-br from-primary to-secondary pt-6 pb-10 shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="container mx-auto px-4 flex flex-col items-center space-y-4">
        <motion.div
          className="relative group backdrop-blur-sm bg-white/5 rounded-full p-1 shadow-inner"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="w-24 h-24 rounded-full border-4 border-white/90 shadow-lg overflow-hidden relative">
            <Image
              src={avatarSrc}
              alt={`صورة ${fullName}`}
              width={96}
              height={96}
              className="object-cover w-full h-full"
              loading="eager"
              priority
              onError={(e) => {
                e.currentTarget.src = DEFAULT_AVATAR
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/20 backdrop-blur-[1px]" />
          </div>
        </motion.div>

        <motion.div
          className="text-center space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-2xl font-bold text-white drop-shadow-md font-serif">
            {fullName}
          </h1>

          <div className="flex flex-col items-center gap-2 text-sm">
            <div className="badge bg-white/10 text-white/90 px-3 py-1 rounded-full flex items-center gap-1">
              <FiUser className="shrink-0" aria-hidden="true" />
              <span className="truncate max-w-[160px]" title={`@${username}`}>
                @{username}
              </span>
            </div>

            {joinDate && (
              <div className="flex items-center text-white/80 gap-1">
                <FiClock className="shrink-0" aria-hidden="true" />
                <span>عضو منذ {formattedJoinDate}</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}