/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        command: {
          bg: '#0A0E17',
          card: '#111827',
          surface: '#1A2234',
          border: '#2A364F',
          muted: '#8E9EB5',
          text: '#F3F4F6',
          blue: '#2563EB',
          cyan: '#06B6D4',
          emergency: '#EF4444',
          warning: '#F59E0B',
          success: '#10B981',
          purple: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
