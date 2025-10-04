// src/components/FooterNav.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import type { ElementType } from 'react'
import { cn } from '@/lib/utils'
import { Home, CreditCard, User } from 'lucide-react' // ⬅️ Lucide

type NavItem = { path: string; icon: ElementType; label: string }

type FooterNavProps = {
  items?: NavItem[]
  currentPath?: string
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { path: '/', icon: Home, label: 'الرئيسية' },
  { path: '/shop', icon: CreditCard, label: 'الاشتراكات' },
  { path: '/profile', icon: User, label: 'الملف' },
]

export default function FooterNav({ items = DEFAULT_NAV_ITEMS, currentPath }: FooterNavProps) {
  const pathname = usePathname()
  const resolvedPath = (() => {
    const candidate = currentPath ?? pathname ?? '/'
    if (!candidate.startsWith('/')) {
      return `/${candidate}`
    }
    return candidate || '/'
  })()
  const tabVariants = {
    active: { y: -2, transition: { type: 'spring', stiffness: 400, damping: 25 } },
    inactive: { y: 0, transition: { type: 'spring', stiffness: 400, damping: 25 } }
  }

  return (
    <nav
      dir="rtl"
      className="fixed bottom-0 left-0 right-0 z-50 h-[70px] bg-gray-50/90 font-arabic backdrop-blur-lg border-t border-gray-200/80"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} // ⬅️ دعم الـ notch
    >
      <div className="flex justify-around items-stretch h-full max-w-lg mx-auto">
        {items.map((item) => {
          const isActive = resolvedPath === item.path
          return (
            <Link
              href={item.path}
              key={item.path}
              className={cn(
                'relative flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-300 ease-out',
                isActive ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <motion.div
                className="flex flex-col items-center"
                animate={isActive ? 'active' : 'inactive'}
                variants={tabVariants}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </motion.div>

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
