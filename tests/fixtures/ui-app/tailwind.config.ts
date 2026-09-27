import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#eef6ff', 500: '#1d6fe0', 600: '#1759b5' },
        surface: '#ffffff',
        muted: '#6b7280',
        danger: '#c62828',
      },
      spacing: { gutter: '1.5rem' },
    },
  },
} satisfies Config
