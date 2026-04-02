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
          bg: '#0B0F19',
          card: '#111827', 
          border: '#1E293B',
          text: '#E5E7EB',
          muted: '#9CA3AF',
          primary: '#6366F1',
          primaryHover: '#4F46E5',
          accent: '#22C55E',
          accentHover: '#16A34A',
        }
      }
    },
  },
  plugins: [],
}
