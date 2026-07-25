/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0D1B2A',
          mid: '#1B3A5C',
          green: '#1FD07A',
          'green-dark': '#17B369',
          'green-light': '#E8F5EE',
          red: '#FF4757',
          amber: '#F59E0B',
          bg: '#F5F7FA',
        },
      },
    },
  },
  plugins: [],
}
