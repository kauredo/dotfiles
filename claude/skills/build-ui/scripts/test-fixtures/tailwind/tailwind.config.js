/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F5EFE6',
        foreground: '#1C1917',
        primary: {
          DEFAULT: '#C2410C',
          foreground: '#FFF7ED',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
      },
    },
  },
};
