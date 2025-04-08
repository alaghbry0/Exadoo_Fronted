'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar as FlowbiteNavbar } from 'flowbite-react';
import { FiBell } from 'react-icons/fi';
import { useNotificationsContext } from '@/context/NotificationsContext';

const Navbar: React.FC = () => {
  const { unreadCount } = useNotificationsContext();
  const [displayCount, setDisplayCount] = useState(unreadCount);
  const [isAnimating, setIsAnimating] = useState(false);

  // ✅ مزامنة فورية مع تحديثات القيمة الحقيقية
  useEffect(() => {
    if (unreadCount !== displayCount) {
      // بدء التحريك
      setIsAnimating(true);

      // تحديث القيمة فورًا
      setDisplayCount(unreadCount);

      // إيقاف التحريك بعد 300ms
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [unreadCount, displayCount]);

  // ✅ التحقق من القيم الصحيحة
  const validatedCount = Math.max(0, Number(displayCount)) || 0;

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
              priority
            />
            <span className="text-xl font-bold text-gray-900">Exaado</span>
          </Link>

          <Link
            href="/notifications"
            className="relative hover:opacity-75 transition-opacity"
            aria-label="الإشعارات"
          >
            <FiBell className="w-6 h-6 text-gray-700" />
            {validatedCount > 0 && (
              <span className={`
                absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center
                ${isAnimating ? 'animate-ping-once' : ''}
              `}>
                {validatedCount > 99 ? '99+' : validatedCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <style jsx global>{`
        @keyframes ping-once {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-ping-once {
          animation: ping-once 0.3s ease-out;
        }
      `}</style>
    </FlowbiteNavbar>
  );
};

export default Navbar;
