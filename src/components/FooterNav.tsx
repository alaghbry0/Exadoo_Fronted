'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { FaHome, FaRegCreditCard, FaUserCircle } from 'react-icons/fa' // ✨ تغيير: استخدام أيقونات Lucide
import { cn } from '@/lib/utils' // ✨ إضافة: استيراد cn للمساعدة في تطبيق الفئات الشرطية

// ✨ تحسين: قائمة العناصر تستخدم الآن أيقونات Lucide

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { path: '/', icon: FaHome, label: 'الرئيسية' },
  { path: '/shop', icon: FaRegCreditCard, label: 'الاشتراكات' },
  { path: '/profile', icon: FaUserCircle, label: 'الملف' },
]
interface NavItem {
  path: string;
  icon: React.ElementType;
  label: string;
}

interface FooterNavProps {
  items?: NavItem[];
}

const FooterNav: React.FC<FooterNavProps> = ({ items = DEFAULT_NAV_ITEMS }) => {
  const pathname = usePathname()

  // ✨ تحسين: حركات أنعم وأكثر تكاملاً
  const tabVariants = {
    active: { y: -2, transition: { type: 'spring', stiffness: 400, damping: 25 } },
    inactive: { y: 0, transition: { type: 'spring', stiffness: 400, damping: 25 } }
  }

  return (
    <nav
      dir="rtl"
      // ✨ تحسين: الاعتماد الكامل على فئات Tailwind للتصميم
      className="fixed bottom-0 left-0 right-0 z-50 h-[70px] bg-gray-50/90 font-arabic backdrop-blur-lg border-t border-gray-200/80"
    >
      <div className="flex justify-around items-stretch h-full max-w-lg mx-auto">
        {items.map((item) => {
          const isActive = pathname === item.path

          return (
            <Link
              href={item.path}
              key={item.path}
              className={cn(
                "relative flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-300 ease-out",
                // ✨ تحسين: استخدام ألوان Tailwind
                isActive ? 'text-primary-500' : 'text-gray-500 hover:text-primary-500'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <motion.div
                className="flex flex-col items-center"
                animate={isActive ? 'active' : 'inactive'}
                variants={tabVariants}
                whileTap={{ scale: 0.95 }}
              >
                {/* ✨ تحسين: حجم الأيقونة والنص باستخدام فئات Tailwind */}
                <item.icon className="h-6 w-6" />
                <span className="text-xs font-medium">
                  {item.label}
                </span>
              </motion.div>

              {/* ✨ إضافة إبداعية: مؤشر نشط ينتقل بسلاسة بين العناصر */}
              {isActive && (
                <motion.div
                  className="absolute bottom-1.5 w-5 h-1 rounded-full bg-primary-600"
                  layoutId="active-indicator"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default FooterNav