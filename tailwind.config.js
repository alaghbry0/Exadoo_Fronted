/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // =============================
      // نظام ألوان محسّن ومتطور
      // =============================
      colors: {
        // الألوان الأساسية المحسّنة
        primary: {
          DEFAULT: '#0084FF',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#0084FF',
          600: '#0066CC',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        
        // ألوان ثانوية متطورة
        secondary: {
          DEFAULT: '#8B5CF6',
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8B5CF6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        
        // ألوان النجاح المحسّنة
        success: {
          DEFAULT: '#10B981',
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        
        // ألوان التحذير
        warning: {
          DEFAULT: '#F59E0B',
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#F59E0B',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        
        // ألوان الخطأ
        error: {
          DEFAULT: '#EF4444',
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#EF4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        
        // ألوان محايدة محسّنة للـ Dark Mode
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          850: '#1f1f1f',
          900: '#171717',
          925: '#0f0f0f',
          950: '#0a0a0a',
        },
        
        // ألوان تدرجية خاصة
        gradient: {
          'blue-purple': 'linear-gradient(135deg, #0084FF 0%, #8B5CF6 100%)',
          'purple-pink': 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
          'blue-cyan': 'linear-gradient(135deg, #0084FF 0%, #06B6D4 100%)',
          'green-blue': 'linear-gradient(135deg, #10B981 0%, #0084FF 100%)',
          'orange-red': 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
        }
      },
      
      // =============================
      // المسافات المحسّنة
      // =============================
      spacing: {
        '4.5': '1.125rem',   // 18px
        '5.5': '1.375rem',   // 22px
        '6.5': '1.625rem',   // 26px
        '7.5': '1.875rem',   // 30px
        '8.5': '2.125rem',   // 34px
        '9.5': '2.375rem',   // 38px
        '15': '3.75rem',     // 60px
        '17': '4.25rem',     // 68px
        '18': '4.5rem',      // 72px
        '19': '4.75rem',     // 76px
        '21': '5.25rem',     // 84px
        '22': '5.5rem',      // 88px
        '30': '7.5rem',      // 120px
        '35': '8.75rem',     // 140px
        '40': '10rem',       // 160px
        '44': '11rem',       // 176px
        '50': '12.5rem',     // 200px
        '60': '15rem',       // 240px
        '70': '17.5rem',     // 280px
        '80': '20rem',       // 320px
        '90': '22.5rem',     // 360px
        '100': '25rem',      // 400px
      },
      
      // =============================
      // Border Radius محسّن
      // =============================
      borderRadius: {
        'xs': '0.125rem',    // 2px
        'sm': '0.25rem',     // 4px
        'DEFAULT': '0.375rem', // 6px
        'md': '0.5rem',      // 8px
        'lg': '0.75rem',     // 12px
        'xl': '1rem',        // 16px
        '2xl': '1.25rem',    // 20px
        '3xl': '1.5rem',     // 24px
        '4xl': '2rem',       // 32px
        '5xl': '2.5rem',     // 40px
        '6xl': '3rem',       // 48px
      },
      
      // =============================
      // ظلال محسّنة
      // =============================
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'none': 'none',
        
        // ظلال ملونة خاصة
        'primary-sm': '0 4px 14px 0 rgba(0, 132, 255, 0.15)',
        'primary-md': '0 8px 25px 0 rgba(0, 132, 255, 0.2)',
        'primary-lg': '0 20px 40px -12px rgba(0, 132, 255, 0.25)',
        'primary-glow': '0 0 40px rgba(0, 132, 255, 0.3)',
        
        'secondary-sm': '0 4px 14px 0 rgba(139, 92, 246, 0.15)',
        'secondary-md': '0 8px 25px 0 rgba(139, 92, 246, 0.2)',
        'secondary-lg': '0 20px 40px -12px rgba(139, 92, 246, 0.25)',
        
        'success-sm': '0 4px 14px 0 rgba(16, 185, 129, 0.15)',
        'success-md': '0 8px 25px 0 rgba(16, 185, 129, 0.2)',
        
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-strong': '0 8px 32px 0 rgba(31, 38, 135, 0.5)',
      },
      
      // =============================
      // تدرجات الخلفية
      // =============================
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #0084FF 0%, #0066CC 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
        'gradient-success': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        'gradient-warning': 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        'gradient-hero-light': 'linear-gradient(135deg, rgba(239, 246, 255, 0.8) 0%, rgba(219, 234, 254, 0.6) 35%, rgba(196, 181, 253, 0.4) 100%)',
        'gradient-hero-dark': 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(30, 41, 59, 0.8) 35%, rgba(51, 65, 85, 0.7) 100%)',
        
        // تدرجات متقدمة
        'mesh-gradient-1': 'radial-gradient(at 40% 20%, hsla(228,100%,74%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,1) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(340,100%,76%,1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(22,100%,77%,1) 0px, transparent 50%), radial-gradient(at 80% 100%, hsla(242,100%,70%,1) 0px, transparent 50%), radial-gradient(at 0% 0%, hsla(343,100%,76%,1) 0px, transparent 50%)',
        
        // أنماط خلفية
        'grid-pattern': 'linear-gradient(rgba(0, 132, 255, 0.05) 1px, transparent 1px), linear-gradient(to right, rgba(0, 132, 255, 0.05) 1px, transparent 1px)',
        'dot-pattern': 'radial-gradient(rgba(0, 132, 255, 0.1) 1px, transparent 1px)',
      },
      
      // =============================
      // أحجام الخط المحسّنة
      // =============================
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
    
      
      // =============================
      // سُمك الخطوط
      // =============================
      fontWeight: {
        'thin': '100',
        'extralight': '200',
        'light': '300',
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
        'extrabold': '800',
        'black': '900',
      },
      
      // =============================
      // الشاشات (Breakpoints)
      // =============================
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
        
        // شاشات خاصة
        'tablet': '640px',
        'laptop': '1024px',
        'desktop': '1280px',
        'wide': '1536px',
        
        // شاشات الطول
        'tall': { 'raw': '(min-height: 800px)' },
        'short': { 'raw': '(max-height: 600px)' },
      },
      
      // =============================
      // الحركات والانتقالات
      // =============================
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'spin-reverse': 'spin 1s linear infinite reverse',
        'bounce-gentle': 'bounce 2s infinite',
        'pulse-gentle': 'pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'gradient': 'gradient 3s ease-in-out infinite',
        'scale-in': 'scale-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-right': 'slide-right 0.5s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
      },
      
      // =============================
      // مدة الانتقال
      // =============================
      transitionDuration: {
        '0': '0ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
        '2000': '2000ms',
      },
      
      // =============================
      // منحنيات الانتقال
      // =============================
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'bounce-out': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'swift': 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
      
      // =============================
      // Z-Index
      // =============================
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      
      // =============================
      // Backdrop Blur
      // =============================
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
    },
  },
  plugins: [
    // إضافة plugins مفيدة
    require('flowbite/plugin')({
      charts: true,
    }),
    
    // Plugin مخصص للتدرجات النصية
    function({ addUtilities, theme, e }) {
      const colors = theme('colors');
      const gradientUtilities = {};
      
      Object.keys(colors).forEach(colorName => {
        if (typeof colors[colorName] === 'object') {
          gradientUtilities[`.${e(`text-gradient-${colorName}`)}`] = {
            background: `linear-gradient(135deg, ${colors[colorName][400]}, ${colors[colorName][600]})`,
            '-webkit-background-clip': 'text',
            'background-clip': 'text',
            '-webkit-text-fill-color': 'transparent',
          };
        }
      });
      
      addUtilities(gradientUtilities);
    },
    
    // Plugin مخصص للظلال الملونة
    function({ addUtilities, theme }) {
      addUtilities({
        '.shadow-primary': {
          'box-shadow': `0 10px 25px -5px ${theme('colors.primary.500')}25`,
        },
        '.shadow-secondary': {
          'box-shadow': `0 10px 25px -5px ${theme('colors.secondary.500')}25`,
        },
        '.shadow-success': {
          'box-shadow': `0 10px 25px -5px ${theme('colors.success.500')}25`,
        },
        '.shadow-warning': {
          'box-shadow': `0 10px 25px -5px ${theme('colors.warning.500')}25`,
        },
        '.shadow-error': {
          'box-shadow': `0 10px 25px -5px ${theme('colors.error.500')}25`,
        },
      });
    },
  ],
}