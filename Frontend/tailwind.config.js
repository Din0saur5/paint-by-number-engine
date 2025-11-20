/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 18px 60px rgba(15, 23, 42, 0.18)',
      },
    },
  },
  daisyui: {
    themes: [
      {
        pbn: {
          primary: '#2563eb',
          'primary-content': '#f8fbff',
          secondary: '#0ea5e9',
          accent: '#f97316',
          neutral: '#0f172a',
          'base-100': '#f8fafc',
          'base-200': '#e2e8f0',
          info: '#0ea5e9',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
    ],
    darkTheme: 'pbn',
  },
  plugins: [daisyui],
}
