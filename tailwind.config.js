

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/flowbite/**/*.js",
    "./node_modules/flowbite-react/**/*.js",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // اللون الأساسي للثيم
        primary: {
          50:  '#eff6ff',
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
        // اللون الثانوي للاختلاف والعناصر المميزة
        secondary: {
          DEFAULT: '#ff5722',
          50:  '#ffece3',
          100: '#ffd9c8',
          200: '#ffb392',
          300: '#ff8c5b',
          400: '#ff7240',
          500: '#ff5722',
          600: '#e64b1f',
          700: '#b33d1a',
          800: '#802912',
          900: '#4d180b',
        },

        // --- إضافة جديدة: ألوان للحالات ---
        success: {
          100: '#dcfce7',
          700: '#15803d',
        },
        error: {
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
        },
        warning: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        // احتفظ ببقية الألوان الحيادية
        neutral: {
          100: "#f5f5f5",
          200: "#eeeeee",
          300: "#e0e0e0",
          400: "#bdbdbd",
          500: "#9e9e9e",
          600: "#757575",
          700: "#616161",
          800: "#424242",
          900: "#212121",
        },
      },
      fontFamily: {
        arabic: ['Almarai', 'sans-serif'],
        sans:   ['Outfit', 'sans-serif'],
        display:['Orlean', 'sans-serif'],
      },
      spacing: {
        section: '4rem',
        card:    '1rem',
      },
      borderRadius: {
        xl:  '1rem',
        '2xl':'1.5rem',
      },
      boxShadow: {
        'plan-card':  '0 10px 15px -3px var(--tw-shadow-color)',
        'plan-hover': '0 20px 25px -5px var(--tw-shadow-color)',
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
    },
  },
  plugins: [
    require('flowbite/plugin'),
  ],
  darkMode: 'class',
};