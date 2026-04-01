/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6600',
        'primary-hover': '#E55C00',
        'primary-muted': 'rgba(255,102,0,0.15)',
        'bg-base': '#0A0A0A',
        'bg-surface': '#111111',
        'bg-elevated': '#1E1E1E',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A0A0A0',
        'text-tertiary': '#5A5A5A',
        'border-default': 'rgba(255,255,255,0.08)',
        'status-active': '#22C55E',
        'status-inactive': '#EF4444',
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
