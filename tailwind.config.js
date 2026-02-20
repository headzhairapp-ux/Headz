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
        brand: {
          DEFAULT: '#E1262D',
          dark: '#B91C1C',
          light: '#F87171'
        },
        green: {
          400: '#22c55e',
          500: '#16a34a'
        }
      }
    },
  },
  plugins: [],
}
