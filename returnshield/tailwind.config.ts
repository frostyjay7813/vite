import type { Config } from 'tailwindcss'

export const tailwindConfig = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: '#00FFFF',
          purple: '#BB86FC',
          ink: '#050816',
          panel: 'rgba(15, 23, 42, 0.72)',
        },
      },
      boxShadow: {
        neon: '0 0 28px rgba(0, 255, 255, 0.28)',
        purple: '0 0 28px rgba(187, 134, 252, 0.28)',
      },
    },
  },
  plugins: [],
} satisfies Config

export default tailwindConfig
