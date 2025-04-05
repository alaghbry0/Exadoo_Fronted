// components/Navbar.tsx
'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar as FlowbiteNavbar } from 'flowbite-react'
import { FiBell } from 'react-icons/fi'
import axios from 'axios'

// تعريف الأنواع
type UnreadCountResponse = {
  unread_count: number
}

const Navbar: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const telegramId =
    typeof window !== 'undefined' ? localStorage.getItem('telegram_id') : null

  const fetchUnreadCount = async () => {
    try {
      const { data } = await axios.get<UnreadCountResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/unread/count`,
        {
          params: { telegram_id: telegramId }
        }
      )
      setUnreadCount(data.unread_count)
      setError('')
    } catch (err) {
      console.error('فشل في جلب الإشعارات:', err)
      setError('فشل في تحميل الإشعارات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!telegramId) return
    fetchUnreadCount()

    const interval = setInterval(fetchUnreadCount, 60000)
    return () => clearInterval(interval)
  }, [telegramId])

  return (
    <FlowbiteNavbar className="bg-white border-b border-gray-100 sticky top-0 z-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-1.5">
            <Image
              src="/logo.png"
              alt="Exaado Logo"
              width={48}
              height={48}
              className="p-1.5"
            />
            <span className="text-xl font-bold text-gray-900">Exaado</span>
          </Link>
          <Link
            href="/notifications"
            className="relative hover:opacity-75 transition-opacity"
            aria-label="الإشعارات"
          >
            <FiBell className="w-6 h-6 text-gray-700" />
            {!loading && unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            {error && (
              <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full px-2">
                !
              </span>
            )}
          </Link>
        </div>
      </div>
    </FlowbiteNavbar>
  )
}

export default Navbar