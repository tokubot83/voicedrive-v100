/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '0px',
        'sm': '576px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1440px',
      },
      maxWidth: {
        'container': '1200px',
        'main': '600px',
        'sidebar-left': '275px',
        'sidebar-right': '350px',
      },
      width: {
        'sidebar-left': '275px',
        'sidebar-right': '350px',
      },
      animation: {
        'slideDown': 'slideDown 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-in',
      },
      keyframes: {
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}