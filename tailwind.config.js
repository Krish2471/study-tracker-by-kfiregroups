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
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-hover': 'var(--surface-hover)',
        text: 'var(--text)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        brand: 'var(--brand)',
        'brand-light': 'var(--brand-light)',
        'brand-dark': 'var(--brand-dark)',
        accent: 'var(--accent)',
        'accent-light': 'var(--accent-light)',
        danger: 'var(--danger)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        border: 'var(--border)',
        coin: '#FFD700',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(139, 92, 246, 0.15)',
        'glow-brand': '0 0 30px rgba(139, 92, 246, 0.25)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.06)',
        'card-dark': '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'coin-spin': 'coin-spin 1s ease-in-out',
        'level-up': 'level-up 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'coin-spin': {
          '0%': { transform: 'rotateY(0deg) scale(1)' },
          '50%': { transform: 'rotateY(180deg) scale(1.2)' },
          '100%': { transform: 'rotateY(360deg) scale(1)' },
        },
        'level-up': {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
