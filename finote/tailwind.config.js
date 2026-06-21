/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          50: '#EEEEFF', 100: '#E0E0FD', 200: '#C7C8FB',
          300: '#A5A6F6', 400: '#8184F1', 500: '#6366F1',
          600: '#4F46E5', 700: '#4338CA', 800: '#3730A3', 900: '#312E81',
        },
        secondary: { DEFAULT: '#8B5CF6', 500: '#8B5CF6', 600: '#7C3AED' },
        accent: { DEFAULT: '#22C55E', 400: '#4ADE80', 500: '#22C55E', 600: '#16A34A' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        'gradient-accent': 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
        'gradient-danger': 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
        'gradient-warning': 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        'gradient-gold': 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
      },
      boxShadow: {
        'glow-primary': '0 0 24px rgba(99, 102, 241, 0.35)',
        'glow-accent': '0 0 24px rgba(34, 197, 94, 0.35)',
        'glow-gold': '0 0 24px rgba(245, 158, 11, 0.35)',
        'card': '0 4px 24px rgba(0,0,0,0.25)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.35)',
        'fab': '0 8px 32px rgba(99,102,241,0.5)',
        'modal': '0 24px 80px rgba(0,0,0,0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.25s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.8s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-soft': 'bounceSoft 0.5s ease-out',
        'fab-open': 'fabOpen 0.2s ease-out',
        'achievement-unlock': 'achievementUnlock 0.6s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { '0%': { opacity: '0', transform: 'translateY(-16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideLeft: { '0%': { opacity: '0', transform: 'translateX(16px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.92)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        bounceSoft: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.1)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        fabOpen: {
          '0%': { opacity: '0', transform: 'scale(0.7) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        achievementUnlock: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      transitionDuration: { DEFAULT: '200ms' },
    },
  },
  plugins: [],
}
