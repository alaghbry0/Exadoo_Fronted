/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
      backgroundImage: {
        'pattern-modern-lines': "url('/pattern-modern-lines.svg')",
        'pattern-modern-dots': "url('/pattern-modern-dots.svg')",
      },
      colors: {
        'exaado-green': '#2E7D32', // لون أخضر Exaado الرئيسي
        'exaado-blue': '#0D47A1',  // لون أزرق Exaado الرئيسي
      },
    },
  },
  plugins: [], // Removed tailwindcss-directional plugin here
}