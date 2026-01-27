/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          900: '#0a1628',
          800: '#1e2936',
          700: '#2a3441',
          600: '#3a4553',
          500: '#5e6c84',
          400: '#7c8ba1',
          300: '#a8b2c1',
          200: '#d9e2ec',
          100: '#f0f4f8'
        },
        purple: {
          900: '#b91c1c',
          600: '#dc2626',
          500: '#ef4444',
          400: '#f87171'
        },
        pink: {
          900: '#991b1b',
          600: '#b91c1c',
          500: '#dc2626',
          400: '#ef4444'
        },
        blue: {
          600: '#f5f5f5',
          500: '#fafafa',
          400: '#ffffff'
        },
        green: {
          400: '#22c55e',
          500: '#16a34a'
        },
        red: {
          900: '#7f1d1d',
          700: '#b91c1c',
          600: '#dc2626',
          500: '#ef4444',
          400: '#f87171'
        },
        cyan: {
          600: '#f5f5f5',
          500: '#fafafa',
          400: '#ffffff'
        }
      }
    },
  },
  plugins: [],
}