
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
    "!./node_modules/**",
    "!./dist/**"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        saffron: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        }
      },
      fontFamily: {
        hindi: ['"Noto Sans Devanagari"', '"Noto Sans"', 'sans-serif'],
        sans: ['"Noto Sans"', 'sans-serif'],
        logo: ['"Dancing Script"', 'cursive'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.3s ease-out forwards',
        'slide-in-bottom': 'slideInBottom 0.3s ease-out forwards',
        'pop': 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'pulse-slow': 'pulse 3s infinite',
        'toast-in': 'toastIn 0.3s ease-out forwards',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'float-slow-reverse': 'float-slow-reverse 7s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInBottom: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        toastIn: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(20px, 30px)' },
        },
        'float-slow-reverse': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(-20px, -20px)' },
        }
      }
    }
  },
  plugins: [],
}
