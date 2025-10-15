/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Royal Indian Heritage Color Palette
        primary: {
          50: '#fdf6e8',
          100: '#f9e8c2',
          200: '#f3d59a',
          300: '#edc171',
          400: '#e8ad48',
          500: '#d4941f', // Main royal gold
          600: '#b8801a',
          700: '#9c6c16',
          800: '#805811',
          900: '#64440d',
        },
        secondary: {
          50: '#f5f1e8',
          100: '#e6d7c3',
          200: '#d7bd9e',
          300: '#c8a279',
          400: '#b98854',
          500: '#aa6e2f', // Royal beige
          600: '#925e28',
          700: '#7a4e21',
          800: '#623e1a',
          900: '#4a2e13',
        },
        accent: {
          50: '#fef4f2',
          100: '#fde4df',
          200: '#fbc4ba',
          300: '#f89e8f',
          400: '#f4775f',
          500: '#e85a3f', // Royal terracotta
          600: '#d13d2f',
          700: '#b12f26',
          800: '#912623',
          900: '#782323',
        },
        royal: {
          gold: '#d4941f',
          beige: '#f3d59a',
          brown: '#8b4513',
          cream: '#fdf6e8',
          terracotta: '#e85a3f',
          emerald: '#059669',
          purple: '#7c3aed',
        },
        status: {
          online: '#059669',
          away: '#f59e0b',
          busy: '#dc2626',
          offline: '#6b7280',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        background: '#fdf6e8',
        surface: '#ffffff',
        'text-primary': '#64440d',
        'text-secondary': '#9c6c16',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        hindi: ['Noto Sans Devanagari', 'system-ui', 'sans-serif'],
        gujarati: ['Noto Sans Gujarati', 'system-ui', 'sans-serif'],
        royal: ['Playfair Display', 'serif'],
        elegant: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'royal-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4941f' fill-opacity='0.05'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20v20h20zm0 0c0 11.046 8.954 20 20 20v-20H20z'/%3E%3C/g%3E%3C/svg%3E\")",
        'mandala-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4941f' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3Ccircle cx='30' cy='30' r='12'/%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'royal': '0 4px 14px 0 rgba(212, 148, 31, 0.15)',
        'royal-lg': '0 10px 30px 0 rgba(212, 148, 31, 0.2)',
        'elegant': '0 2px 8px 0 rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(212, 148, 31, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(212, 148, 31, 0.6)' },
        },
      },
      maxWidth: {
        'mobile': '428px',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      }
    },
  },
  plugins: [],
}