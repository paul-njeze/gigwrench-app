import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        gw: {
          bg: '#07090D', bg2: '#0B0F17', bg3: '#0F1520', bg4: '#141C28',
          sur: '#182030', sur2: '#1E2A3C',
          bdr: 'rgba(255,255,255,0.06)', bdr2: 'rgba(255,255,255,0.11)',
          text: '#ECF0F6', muted: '#7A8CA0', dim: '#2E3D52',
          accent: '#F5C518', accent2: '#FF6B2B', green: '#22C55E', blue: '#3B82F6',
        },
      },
    },
  },
  plugins: [],
}

export default config
