/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0A2540',
        'primary-dark': '#081c30',
        secondary: '#2E6F95',
        'secondary-dark': '#245977',
        light: '#E5E7EB',
        dark: '#111827',
        white: '#FFFFFF',
        surface: '#F8FAFC',
        'surface-alt': '#EEF4F8',
        border: '#CBD5E1',
        muted: '#64748B',
        success: '#0F766E',
        warning: '#B45309',
        danger: '#B91C1C',
      },
      boxShadow: {
        panel: '0 24px 70px rgba(10, 37, 64, 0.12)',
        float: '0 18px 48px rgba(10, 37, 64, 0.1)',
        glow: '0 14px 34px rgba(46, 111, 149, 0.18)',
      },
      backgroundImage: {
        'legal-hero': 'radial-gradient(circle at top left, rgba(46, 111, 149, 0.2), transparent 35%), linear-gradient(135deg, #0A2540 0%, #163756 45%, #2E6F95 100%)',
        'legal-surface': 'radial-gradient(circle at top, rgba(46, 111, 149, 0.12), transparent 30%), linear-gradient(180deg, #F8FAFC 0%, #EEF4F8 100%)',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
