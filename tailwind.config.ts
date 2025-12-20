import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Legacy glass colors (kept for compatibility)
        glass: {
          white: 'rgba(255, 255, 255, 0.7)',
          dark: 'rgba(0, 0, 0, 0.5)',
          light: 'rgba(255, 255, 255, 0.1)',
        },
        // Dark theme palette
        dark: {
          bg: {
            primary: '#0a0a0a',
            secondary: '#121212',
            tertiary: '#1a1a1a',
          },
          card: {
            DEFAULT: '#1e1e1e',
            hover: '#252525',
            elevated: '#2a2a2a',
          },
          border: {
            DEFAULT: 'rgba(255, 255, 255, 0.08)',
            subtle: 'rgba(255, 255, 255, 0.05)',
            strong: 'rgba(255, 255, 255, 0.12)',
          },
          text: {
            primary: '#ffffff',
            secondary: '#a1a1aa',
            muted: '#71717a',
          },
        },
        // Coral accent palette
        coral: {
          50: '#fff5f2',
          100: '#ffe8e2',
          200: '#ffd5c9',
          300: '#ffb5a0',
          400: '#FF8A65',
          500: '#FF6B4A',
          600: '#FF5733',
          700: '#e63e1a',
          800: '#c03516',
          900: '#9e2f16',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.06)',
        'glass-lg': '0 12px 48px 0 rgba(0, 0, 0, 0.12)',
        'inner-white': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
