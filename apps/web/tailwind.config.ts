import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2563eb',
          50: '#eff6ff',
          100: '#dbeafe',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        fair: {
          DEFAULT: '#16a34a',
          light: '#dcfce7',
          border: '#86efac',
        },
        caution: {
          DEFAULT: '#d97706',
          light: '#fef9c3',
          border: '#fde047',
        },
        excessive: {
          DEFAULT: '#dc2626',
          light: '#fee2e2',
          border: '#fca5a5',
        },
      },
      borderRadius: {
        card: '1rem',
        badge: '9999px',
      },
      boxShadow: {
        card: '0 2px 8px 0 rgb(0 0 0 / 0.08)',
        'card-hover': '0 4px 16px 0 rgb(0 0 0 / 0.12)',
      },
      maxWidth: {
        content: '72rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
