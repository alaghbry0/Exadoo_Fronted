/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/flowbite/**/*.js",
    "./node_modules/flowbite-react/**/*.js", // ✅ دعم Flowbite React
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {

      animation: {
        spin: 'spin 1.2s linear infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
      // 🎨 لوحة الألوان
      colors: {
        'blue': {
          500: '#0084FF',
          600: '#0066CC',
        },
        primary: "#0077ff",
        secondary: "#ff5722",
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
      // 🔠 إعداد الخطوط
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        serif: ['"Merriweather"', 'serif'],
      },
      // 🔠 تحسين أحجام النصوص
      fontSize: {
        xs: "0.75rem", // 12px
        sm: "0.875rem", // 14px
        base: "1rem", // 16px
        lg: "1.125rem", // 18px
        xl: "1.25rem", // 20px
        "2xl": "1.5rem", // 24px
        "3xl": "1.875rem", // 30px
        "4xl": "2.25rem", // 36px
        "5xl": "3rem", // 48px
      },

      boxShadow: {
        'plan-card': '0 10px 15px -3px rgba(0, 132, 255, 0.1)',
        'plan-hover': '0 20px 25px -5px rgba(0, 132, 255, 0.1)'
      },
      // 📏 تخصيص المسافات والهوامش
      spacing: {
      'plan-card': '400px',
        1: "0.25rem",
        2: "0.5rem",
        3: "0.75rem",
        4: "1rem",
        5: "1.25rem",
        6: "1.5rem",
        8: "2rem",
        10: "2.5rem",
        12: "3rem",
        16: "4rem",
        20: "5rem",
      },
      // 📱 تحسين نقاط التوقف للشاشات المختلفة
      screens: {
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      // 🟢 تحسين الزوايا المنحنية للعناصر
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [
    require('flowbite/plugin'), // ✅ دعم Flowbite
  ],
  darkMode: "class", // ✅ دعم الوضع الداكن باستخدام class
};
