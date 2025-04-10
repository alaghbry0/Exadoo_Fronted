'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { FaHome, FaRegCreditCard, FaUserCircle } from 'react-icons/fa'
import { useEffect, useState } from 'react'

// تكوين قابل للتخصيص للشريط السفلي
interface NavTheme {
  height: number;
  iconSize: number;
  textSize: string;
  activeColor: string;
  inactiveColor: string;
  backgroundColor: string;
  backgroundOpacity: number;
  blurIntensity: string;
  hitSlop: number;
  borderColor: string;
  borderOpacity: number;
  indicatorStyle: 'dot' | 'pill' | 'underline';
}

// نوع عنصر التنقل بدون ميزة الإشعارات
interface NavItem {
  path: string;
  icon: React.ElementType;
  label: string;
}

interface FooterNavProps {
  theme?: Partial<NavTheme>;
  items?: NavItem[];
}

const DEFAULT_THEME: NavTheme = {
  height: 70,
  iconSize: 26,
  textSize: '0.75rem',
  activeColor: '#2390f1',
  inactiveColor: '#7a8999',
  backgroundColor: '#f8faff',
  backgroundOpacity: 0.95,
  blurIntensity: '12px',
  hitSlop: 24,
  borderColor: '#2390f1',
  borderOpacity: 0.12,
  indicatorStyle: 'pill'
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { path: '/', icon: FaHome, label: 'الرئيسية' },
  { path: '/shop', icon: FaRegCreditCard, label: 'الاشتراكات' },
  { path: '/profile', icon: FaUserCircle, label: 'الملف' },
]

const FooterNav: React.FC<FooterNavProps> = ({
  theme: customTheme = {},
  items = DEFAULT_NAV_ITEMS
}) => {
  const pathname = usePathname()
  const theme: NavTheme = { ...DEFAULT_THEME, ...customTheme }

  // حالة لتتبع ما إذا كان شريط التنقل مخفياً أثناء التمرير لأسفل
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // تتبع حركة التمرير لإخفاء الشريط عند التمرير لأسفل
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > theme.height) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, theme.height])

  // حركات للشريط عند الظهور والاختفاء
  const navVariants = {
    visible: {
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 40
      }
    },
    hidden: {
      y: theme.height,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 40
      }
    }
  }

  // حركات لعناصر النقر
  const tabVariants = {
    active: {
      color: theme.activeColor,
      scale: 1.05,
      y: -4,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 30
      }
    },
    inactive: {
      color: theme.inactiveColor,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 30
      }
    }
  }

  // حركات للمؤشر النشط
  const indicatorVariants = {
    dot: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      backgroundColor: theme.activeColor,
      marginTop: '4px',
    },
    pill: {
      width: '20px',
      height: '4px',
      borderRadius: '10px',
      backgroundColor: theme.activeColor,
      marginTop: '4px',
    },
    underline: {
      width: '100%',
      height: '3px',
      borderRadius: '2px',
      backgroundColor: theme.activeColor,
      marginTop: '6px',
      maxWidth: '32px',
    }
  }

  return (
    <motion.nav
      dir="rtl"
      initial="visible"
      animate={isVisible ? "visible" : "hidden"}
      variants={navVariants}
      className="fixed bottom-0 w-full z-50 shadow-lg"
      style={{
        height: `${theme.height}px`,
        backdropFilter: `blur(${theme.blurIntensity})`,
        backgroundColor: `${theme.backgroundColor}${Math.round(theme.backgroundOpacity * 255).toString(16).padStart(2, '0')}`,
        borderTop: `1px solid ${theme.borderColor}${Math.round(theme.borderOpacity * 255).toString(16).padStart(2, '0')}`,
      }}
    >
      <div className="mx-auto h-full max-w-lg relative">
        <div className="flex justify-around items-center h-full w-full px-2">
          {items.map((item) => {
            const isActive = pathname === item.path

            return (
              <Link
                href={item.path}
                key={item.path}
                className="relative flex-1 h-full"
                aria-current={isActive ? 'page' : undefined}
              >
                {/* مساحة نقرة موسعة */}
                <div
                  className="absolute inset-0 -top-6 z-20 cursor-pointer"
                  style={{ padding: theme.hitSlop }}
                />

                <motion.div
                  className="flex flex-col items-center justify-center h-full gap-1"
                  initial="inactive"
                  animate={isActive ? "active" : "inactive"}
                  variants={tabVariants}
                  whileTap={{ scale: 0.92 }}
                >
                  <div className="relative">
                    <item.icon size={theme.iconSize} />
                  </div>

                  <span
                    style={{ fontSize: theme.textSize }}
                    className="font-medium transition-colors"
                  >
                    {item.label}
                  </span>

                  {isActive && (
                    <motion.div
                      style={indicatorVariants[theme.indicatorStyle]}
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

export default FooterNav
