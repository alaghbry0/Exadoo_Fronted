'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { FaHome, FaRegCreditCard, FaUserCircle } from 'react-icons/fa';

const NavigationBar: React.FC = () => {
  const pathname = usePathname();

  // إعدادات الشريط القابلة للتعديل
  const NAV_SETTINGS = {
    height: 52,
    iconSize: 22,
    textSize: '0.75rem',
    activeColor: '#2390f1',
    inactiveColor: '#99a6b2',
    spacing: '0.3rem',
    borderWidth: '1px',
    blurIntensity: '8px',
    containerMaxWidth: '500px' // إضافة تحديد عرض أقصى
  };

  const navItems = [
    { path: '/', icon: FaHome, label: 'الرئيسية' },
    { path: '/shop', icon: FaRegCreditCard, label: 'الاشتراكات' },
    { path: '/profile', icon: FaUserCircle, label: 'الملف الشخصي' },
  ];

  return (
    <motion.nav
      dir="rtl"
      className="fixed bottom-0 w-full backdrop-blur-lg bg-[#eff8ff]/90 border-t"
      style={{
        height: `${NAV_SETTINGS.height}px`,
        borderColor: `${NAV_SETTINGS.activeColor}30`,
        borderWidth: NAV_SETTINGS.borderWidth,
        backdropFilter: `blur(${NAV_SETTINGS.blurIntensity})`,
      }}
    >
      <div
        className="mx-auto h-full relative"
        style={{ maxWidth: NAV_SETTINGS.containerMaxWidth }}
      >
        <div className="flex justify-evenly items-center h-full w-full">
          {navItems.map((item) => {
            const isActive = pathname === item.path;

            return (
              <Link
                href={item.path}
                key={item.path}
                className="flex flex-col items-center justify-end relative z-10 flex-1"
                style={{
                  paddingBottom: NAV_SETTINGS.spacing,
                  minWidth: '70px' // تحديد عرض أدنى لكل عنصر
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`p-2 rounded-full`}
                  style={{
                    color: isActive ? NAV_SETTINGS.activeColor : NAV_SETTINGS.inactiveColor,
                  }}
                >
                  <item.icon
                    size={NAV_SETTINGS.iconSize}
                    className="transition-all mx-auto" // إضافة mx-auto للتأكد من المركزية
                  />
                </motion.div>

                <motion.span
                  className={`font-medium text-center`} // إضافة text-center
                  style={{
                    color: isActive ? NAV_SETTINGS.activeColor : NAV_SETTINGS.inactiveColor,
                    fontSize: NAV_SETTINGS.textSize,
                    lineHeight: 1,
                  }}
                >
                  {item.label}
                </motion.span>

                {isActive && (
                  <motion.div
                    className="absolute top-1 w-1 h-1 rounded-full"
                    style={{ backgroundColor: NAV_SETTINGS.activeColor }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
};

export default NavigationBar;