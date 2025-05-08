/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        cursive: ['"Pacifico"', 'cursive'], // or another cursive font
      },
      animation: {
        typing: 'typing 1.5s steps(8, end) forwards',
      },
      keyframes: {
        typing: {
          from: { width: '0' },
          to: { width: '13ch' },
        },
        blink: {
          '0%, 100%': { opacity: '0' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};


