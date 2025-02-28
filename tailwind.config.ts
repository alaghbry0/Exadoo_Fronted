/** @type {import('tailwindcss').Config} */
module.exports = {
  // تأكد من تضمين المسارات التي تحتوي على ملفات الصفحات والمكونات
  content: [
    "./node_modules/flowbite-react/**/*.js", // Path to Flowbite React components - IMPORTANT
     "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",

  ],
  darkMode: 'class', // يمكنك استخدام 'media' أو 'class' حسب تفضيلك
  theme: {
    extend: {
      // 1. تعريف الخطوط
      fontFamily: {
        // خط عربي (Cairo) مع خط لاتيني (Montserrat) أو Roboto
        // سيستخدم المتصفح Cairo أولاً، وإن لم يكن متوفراً ينتقل إلى Montserrat وهكذا.
        sans: ['Cairo', 'Montserrat', 'sans-serif'],
        // يمكنك إضافة أسماء أخرى إذا أردت فصل الخطوط العربية والإنجليزية.
        // example: heading: ['Montserrat', 'sans-serif'], body: ['Cairo', 'sans-serif']
      },

      // 2. تعريف الألوان الأساسية (الهوية البصرية)
      colors: {
        // يمكنك الاكتفاء بأسماء Tailwind القياسية إن شئت، أو تعريف أسماء مخصصة.
        // نعرّف الألوان الرئيسية للتطبيق (Primary, Secondary, Accent...)
        primary: '#2390f1',      // اللون الأساسي (أزرق فاتح)
        secondary: '#eab308',    // اللون الثانوي (أصفر ذهبي)
        accent: '#facc15',       // لون مساعد (أصفر فاتح)
        background: '#f8fafc',   // خلفية عامة
        darkBg: '#1a202c',       // خلفية للأوضاع الداكنة
        // أمثلة لألوان مخصصة قد تحتاجها
        exaadoGreen: '#2E7D32',
        exaadoBlue: '#0D47A1',
      },

      // 3. تعريف خلفيات أو صور خلفية مخصصة (إن لزم الأمر)
      backgroundImage: {
        'pattern-modern-lines': "url('/pattern-modern-lines.svg')",
        'pattern-modern-dots': "url('/pattern-modern-dots.svg')",
      },

      // 4. تعريف مسافات مخصصة أو قيم أخرى
      spacing: {
        '111': '27.75rem', // مثال لإضافة مسافة مخصصة
      },
    },
  },
  // 5. إضافة Plugin Flowbite
  plugins: [
    require('flowbite/plugin'),
  ],
}
