// components/Navbar.tsx
'use client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar as FlowbiteNavbar } from 'flowbite-react'
import { FiBell } from 'react-icons/fi'
import { useNotificationsContext } from '@/context/NotificationsContext' // افترض إنشاء Context للإشعارات

const Navbar: React.FC = () => {
  const { unreadCount } = useNotificationsContext();

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
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </FlowbiteNavbar>
  )
}

export default Navbar;
