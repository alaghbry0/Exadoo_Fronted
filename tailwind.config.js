/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ألوان محسّنة مع تعليقات
      colors: {
        primary: {
          DEFAULT: '#0084FF', // للاستخدام السريع
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
        },
        secondary: {
          DEFAULT: '#ff5722',
          500: '#ff5722',
          600: '#e64b1f',
        },
        success: {
          DEFAULT: '#15803d',
          100: '#dcfce7',
          700: '#15803d',
        },
        error: {
          DEFAULT: '#ef4444',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      
      // مسافات محسّنة
      spacing: {
        'card-sm': '1rem',      // 16px
        'card-md': '1.25rem',   // 20px
        'card-lg': '1.5rem',    // 24px
        'section': '4rem',      // 64px
      },
      
      // Border Radius موحد
      borderRadius: {
        'card': '1.5rem',      // 24px - البطاقات الصغيرة
        'card-lg': '1.875rem', // 30px - البطاقات الكبيرة
        'button': '0.75rem',   // 12px - الأزرار
      },
      
      // Shadows محسّنة
      boxShadow: {
        'card': '0 4px 12px 0 rgba(0, 0, 0, 0.05)',
        'card-hover': '0 8px 24px 0 rgba(0, 102, 204, 0.12)',
        'button': '0 4px 14px 0 rgba(0, 132, 255, 0.25)',
      },
      fontSize: {
        xs:  "0.75rem",
        sm:  "0.875rem",
        base:"1rem",
        lg:  "1.125rem",
        xl:  "1.25rem",
        "2xl":"1.5rem",
        "3xl":"1.875rem",
        "4xl":"2.25rem",
        "5xl":"3rem",
      },
      screens: {
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        '2xl': "1536px",
      },
      animation: {
        'pulse-subtle': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
   plugins: [
    require('flowbite/plugin'),
  ],
  darkMode: 'class',
}