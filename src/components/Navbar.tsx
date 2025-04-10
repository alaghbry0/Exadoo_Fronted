'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar as FlowbiteNavbar } from 'flowbite-react';
import { FiBell } from 'react-icons/fi';
import { useNotificationsContext } from '@/context/NotificationsContext';
import { useRouter } from 'next/router'

const Navbar: React.FC = () => {
  const { unreadCount } = useNotificationsContext();
  const [displayCount, setDisplayCount] = useState(unreadCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  // مزامنة فورية مع تحديثات القيمة الحقيقية
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

    const goTonotificationspage = () => {
    router.push('/notifications');
  };

  // التحقق من القيم الصحيحة
  const validatedCount = Math.max(0, Number(displayCount)) || 0;

  // تنسيق عرض العدد
  const formattedCount = validatedCount > 99 ? '99+' : validatedCount;

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

          <button
            aria-label={`الإشعارات - ${validatedCount > 0 ? `${formattedCount} إشعارات غير مقروءة` : 'لا توجد إشعارات جديدة'}`}
            className="relative group p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={goTonotificationspage}
          >


            <FiBell className={`w-6 h-6 transition-colors duration-200 ${isHovered || validatedCount > 0 ? 'text-blue-600' : 'text-gray-700'}`} />

            {validatedCount > 0 && (
              <span className={`
                absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full
                flex items-center justify-center
                transition-all duration-200
                ${validatedCount > 9 ? 'min-w-6 h-6 px-1' : 'w-5 h-5'}
                ${isAnimating ? 'animate-ping-once' : ''}
                ${isHovered ? 'bg-red-700 transform scale-110' : 'bg-red-600'}
              `}>
                {formattedCount}
              </span>
            )}

            {isHovered && validatedCount === 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            )}

            {/* تلميح عند التحويم */}
            <span className={`
              absolute top-full right-0 mt-2 bg-gray-800 text-white text-xs rounded py-1 px-2
              transition-opacity duration-200 whitespace-nowrap
              ${isHovered ? 'opacity-100' : 'opacity-0 invisible'}
            `}>
              {validatedCount > 0 ? `${formattedCount} إشعارات غير مقروءة` : 'لا توجد إشعارات جديدة'}
            </span>
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes ping-once {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-ping-once {
          animation: ping-once 0.5s ease-out;
        }
        .min-w-6 {
          min-width: 1.5rem;
        }
      `}</style>
    </FlowbiteNavbar>
  );
};

export default Navbar;