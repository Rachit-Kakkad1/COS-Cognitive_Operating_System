/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        cos: {
          bg: '#09090b',
          card: '#18181b', 
          border: '#27272a',
          text: '#f4f4f5',
          muted: '#a1a1aa',
          primary: '#6366f1',
          primaryHover: '#4f46e5',
          accent: '#14b8a6',
          accentHover: '#0d9488',
        }
      }
    },
  },
  plugins: [],
}
