/** @type {import('tailwindcss').Config} */
module.exports = {
  // تأكد من تضمين المسارات التي تحتوي على ملفات الصفحات والمكونات
  content: [
    "./node_modules/flowbite/**/*.js",
     "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",

  ],
  theme: {
    extend: {
      // إضافة لوحة ألوان متكاملة:
      colors: {
        // اللون الأساسي: الأزرق الفاتح
        primary:  'hsl(var(--primary))',
        // يمكن إضافة ألوان تكميلية حسب الحاجة (مثال):
        secondary: "#ff5722",
        // مجموعة ألوان محايدة لتعزيز التباين:
        neutral: {
          100: "#f5f5f5",
          200: "#eeeeee",
          300: "#e0e0e0",
          400: "#bdbdbd",
          500: "#9e9e9e",
          600: "#757575",
          700: "#616161",
          800: "#424242",
          900: "#212121"
        }
      },
      // تحديد الخطوط:
      fontFamily: {
          arabic: ['Tajawal', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        serif: ['"Merriweather"', 'serif']
      },
      // تخصيص أحجام النصوص لتوفير تدرج هرمي واضح:
      fontSize: {
        xs: "0.75rem",      // 12px
        sm: "0.875rem",     // 14px
        base: "1rem",       // 16px
        lg: "1.125rem",     // 18px
        xl: "1.25rem",      // 20px
        "2xl": "1.5rem",    // 24px
        "3xl": "1.875rem",  // 30px
        "4xl": "2.25rem",   // 36px
        "5xl": "3rem"       // 48px
      },
      // تخصيص المسافات والهوامش:
      spacing: {
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
        20: "5rem"
      }
    }
  },
  plugins: [
    require('flowbite/plugin')
  ],
  darkMode: 'class'
}