/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0A0E27',
          blue: '#051A3F',
          emerald: '#10B981',
        }
      }
    },
  },
  plugins: [],
}