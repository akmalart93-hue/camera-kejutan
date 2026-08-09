/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Poppins"', 'sans-serif'],
      },
      keyframes: {
        'pop-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'flash': {
          '0%': { opacity: '0' },
          '20%': { opacity: '0.9' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        'pop-in': 'pop-in 0.4s ease-out',
        'flash': 'flash 0.4s ease-out',
      },
    },
  },
  plugins: [],
}
