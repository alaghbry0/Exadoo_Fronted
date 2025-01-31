'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { FaHome, FaRegCreditCard, FaUserCircle } from 'react-icons/fa'

const NavigationBar: React.FC = () => {
  const pathname = usePathname()

  const NAV_SETTINGS = {
    height: 64, // زيادة الارتفاع لتحسين UX
    iconSize: 24,
    textSize: '0.75rem',
    activeColor: '#2390f1',
    inactiveColor: '#99a6b2',
    blurIntensity: '12px',
    hitSlop: 20 // مساحة نقر إضافية
  }

  const navItems = [
    { path: '/', icon: FaHome, label: 'الرئيسية' },
    { path: '/shop', icon: FaRegCreditCard, label: 'الاشتراكات' },
    { path: '/profile', icon: FaUserCircle, label: 'الملف' },
  ]

  return (
    <motion.nav
      dir="rtl"
      className="fixed bottom-0 w-full backdrop-blur-lg bg-[#eff8ff]/95 border-t-2 border-[#2390f1]/10 z-50 shadow-upward"
      style={{
        height: `${NAV_SETTINGS.height}px`,
        backdropFilter: `blur(${NAV_SETTINGS.blurIntensity})`,
      }}
    >
      <div className="mx-auto h-full max-w-lg relative">
        <div className="flex justify-around items-center h-full w-full px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path

            return (
              <Link
                href={item.path}
                key={item.path}
                className="relative flex-1 h-full"
              >
                {/* مساحة نقرة موسعة */}
                <div
                  className="absolute inset-0 -top-4 z-20 cursor-pointer"
                  style={{ padding: NAV_SETTINGS.hitSlop }}
                />

                <motion.div
                  className="flex flex-col items-center justify-center h-full gap-1"
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon
                    size={NAV_SETTINGS.iconSize}
                    className={`transition-colors ${
                      isActive ? 'text-[#2390f1]' : 'text-[#99a6b2]'
                    }`}
                  />

                  <span
                    className={`text-xs font-medium transition-colors ${
                      isActive ? 'text-[#2390f1]' : 'text-[#99a6b2]'
                    }`}
                  >
                    {item.label}
                  </span>

                  {isActive && (
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full bg-[#2390f1] mt-1"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    />
                  )}
                </motion.div>
              </Link>
            )
          })}
        </div>
      </div>
    </motion.nav>
  )
}

export default NavigationBar