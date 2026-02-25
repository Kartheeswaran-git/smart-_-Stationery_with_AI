/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8f0',
          100: '#faefd9',
          200: '#f5ddb3',
          300: '#efc57e',
          400: '#e8a94a',
          500: '#e0912a',
          600: '#c97520',
          700: '#a55c1c',
          800: '#854a1e',
          900: '#6d3d1b',
          950: '#3c1f0a',
        },
        ink: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#3730a3',
          800: '#312e81',
          900: '#1a2744',
          950: '#0f172a',
        },
        paper: {
          50: '#fdfaf4',
          100: '#faf3e6',
          200: '#f4e8cc',
          300: '#ecd5a8',
          400: '#e2be7e',
          500: '#d4a55a',
          600: '#b8863f',
          700: '#976832',
          800: '#7c542d',
          900: '#664628',
          950: '#362210',
        },
        slate: {
          850: '#151e2e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      backgroundImage: {
        'paper-lines': "repeating-linear-gradient(transparent, transparent 27px, #e8dcc8 27px, #e8dcc8 28px)",
        'dots-pattern': "radial-gradient(circle, #d4a55a20 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
}
