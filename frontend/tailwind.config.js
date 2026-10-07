/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 20px 45px rgba(15, 23, 42, 0.08)',
      },
      colors: {
        brand: {
          50: '#eef7f5',
          100: '#d8efe9',
          200: '#b4e0d7',
          300: '#7ec8b8',
          400: '#4fb39d',
          500: '#2d8d7d',
          600: '#226f65',
          700: '#1c584e',
          800: '#1b483f',
          900: '#183d38',
        },
      },
    },
  },
  plugins: [],
};
