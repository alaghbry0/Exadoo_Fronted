module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}', // يشمل جميع الملفات داخل src
  ],
  theme: {
    extend: {
      backgroundImage: {
        'custom-hero-gradient': 'linear-gradient(90deg, rgba(145,144,152,1) 0%, rgba(122,122,192,1) 28%, rgba(100,196,215,0.9473039215686274) 100%)',
      },
    },
  },
  plugins: [],
};