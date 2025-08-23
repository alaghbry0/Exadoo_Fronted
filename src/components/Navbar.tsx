'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useNotificationsContext } from '@/context/NotificationsContext';

const Navbar: React.FC = () => {
  const { unreadCount } = useNotificationsContext();
  const router = useRouter();

  const [displayCount, setDisplayCount] = useState(unreadCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isBellHovered, setIsBellHovered] = useState(false);

  useEffect(() => {
    if (unreadCount !== displayCount) {
      setIsAnimating(true);
      setDisplayCount(unreadCount);

      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [unreadCount, displayCount]);

  const goToNotificationsPage = () => {
    router.push('/notifications');
  };

  const validatedCount = Math.max(0, Number(displayCount)) || 0;
  const formattedCount = validatedCount > 99 ? '99+' : validatedCount;

  return (
    // تم التغيير إلى dir="ltr" لفرض التخطيط من اليسار لليمين
    <header dir="ltr" className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200/50 px-4 py-2 flex items-center justify-between sticky top-0 z-50" >

      {/* القسم الأيسر: الشعار والاسم */}
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/logo.png"
          alt="Exaado Logo"
          width={40}
          height={40}
          className="object-contain"
          priority
        />
        <span className="text-xl font-bold text-slate-800">Exaado</span>
      </Link>


      {/* القسم الأيمن: زر الإشعارات */}
      <div className="flex items-center gap-2">
        <button
          aria-label={`الإشعارات - ${validatedCount > 0 ? `${formattedCount} إشعارات غير مقروءة` : 'لا توجد إشعارات جديدة'}`}
          className="relative p-2 hover:bg-slate-100 rounded-full transition-colors"
          onMouseEnter={() => setIsBellHovered(true)}
          onMouseLeave={() => setIsBellHovered(false)}
          onClick={goToNotificationsPage}
        >
          <Bell className={`w-6 h-6 transition-colors duration-200 ${isBellHovered || validatedCount > 0 ? 'text-blue-600' : 'text-slate-600'}`} />

          {validatedCount > 0 && (
            <span className={`
              absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full
              flex items-center justify-center pointer-events-none
              transition-all duration-300
              ${validatedCount > 9 ? 'min-w-[22px] h-[22px] px-1' : 'w-5 h-5'}
              ${isAnimating ? 'animate-ping-once' : ''}
              ${isBellHovered ? 'bg-red-700 transform scale-110' : 'bg-red-600'}
            `}>
              {formattedCount}
            </span>
          )}

          {isBellHovered && validatedCount === 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white pointer-events-none"></span>
          )}

          <div className={`
            absolute top-full right-0 mt-2 bg-slate-800 text-white text-xs rounded py-1 px-2
            transition-opacity duration-300 whitespace-nowrap pointer-events-none
            ${isBellHovered ? 'opacity-100' : 'opacity-0 invisible'}
          `}>
            {validatedCount > 0 ? `${formattedCount} إشعارات غير مقروءة` : 'لا توجد إشعارات جديدة'}
          </div>
        </button>
      </div>

      <style jsx global>{`
        @keyframes ping-once {
          0% { transform: scale(1); }
          50% { transform: scale(1.4); }
          100% { transform: scale(1); }
        }
        .animate-ping-once {
          animation: ping-once 0.5s ease-out;
        }
      `}</style>
    </header>
  );
};

export default Navbar;
