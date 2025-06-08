/** @type {import('tailwindcss').Config} */
export default {
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
      }
    },
  },
  plugins: [],
}