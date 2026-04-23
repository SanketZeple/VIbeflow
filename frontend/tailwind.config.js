/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // UI Redesign color palette - Dark theme (JIRA-inspired)
        // Page bg
        'page-bg': '#1D2125',
        // Surface (cards, modals, sidebar)
        'surface': '#22272B',
        // Border
        'border': {
          DEFAULT: '#3D474F',
          hover: '#5C6C7A',
        },
        // Text
        'text': {
          primary: '#E6EDF3',
          secondary: '#9FADBC',
          muted: '#7A8699',
        },
        // Accent (primary)
        'accent': {
          DEFAULT: '#579DFF',
          hover: '#388BFF',
          light: '#1C2B41',
        },
        // Danger
        'danger': {
          DEFAULT: '#F87168',
          bg: '#42221F',
        },
        // Success
        'success': {
          DEFAULT: '#4BCE97',
          bg: '#1C3329',
        },
        // Warning
        'warning': {
          DEFAULT: '#F5CD47',
          bg: '#3D2E1A',
        },
        // Column header bg
        'column-header': '#2C333A',
        // Legacy compatibility
        'primary': {
          DEFAULT: '#579DFF',
          50: '#1C2B41',
          100: '#1C2B41',
          200: '#388BFF',
          300: '#579DFF',
          400: '#579DFF',
          500: '#388BFF',
          600: '#388BFF',
          700: '#388BFF',
          800: '#388BFF',
          900: '#388BFF',
        },
        // Background aliases for easy migration
        'background': {
          primary: '#1D2125',
          secondary: '#22272B',
          tertiary: '#2C333A',
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "sans-serif"],
      },
      fontSize: {
        'xs': '11px',
        'sm': '12px',
        'base': '14px',
        'lg': '16px',
        'xl': '18px',
        '2xl': '20px',
        '3xl': '24px',
      },
      borderRadius: {
        DEFAULT: '3px',
        'md': '3px',
        'lg': '3px',
        'xl': '3px',
        'full': '50%',
      },
      spacing: {
        '4': '4px',
        '8': '8px',
        '12': '12px',
        '16': '16px',
        '20': '20px',
        '24': '24px',
        '32': '32px',
        '48': '48px',
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(9, 30, 66, 0.1)',
        'sm': '0 2px 4px rgba(9, 30, 66, 0.1)',
        'md': '0 4px 8px rgba(9, 30, 66, 0.15)',
        'lg': '0 8px 16px rgba(9, 30, 66, 0.2)',
        'xl': '0 12px 24px rgba(9, 30, 66, 0.25)',
        'dropdown': '0 4px 8px rgba(9, 30, 66, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'shine': 'shine 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shine: {
          '100%': { left: '200%' },
        },
      },
    },
  },
  plugins: [],
}