import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './content/**/*.mdx', './public/**/*.svg', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary': 'rgb(var(--color-primary) / <alpha-value>)',
        'primary-content': 'rgb(var(--color-primary-content) / <alpha-value>)',
        'secondary': 'rgb(var(--color-secondary) / <alpha-value>)',
        'secondary-content': 'rgb(var(--color-secondary-content) / <alpha-value>)',
        'accent': 'rgb(var(--color-accent) / <alpha-value>)',
        'accent-content': 'rgb(var(--color-accent-content) / <alpha-value>)',
        'neutral': 'rgb(var(--color-neutral) / <alpha-value>)',
        'neutral-content': 'rgb(var(--color-neutral-content) / <alpha-value>)',
        'base-100': 'rgb(var(--color-base-100) / <alpha-value>)',
        'base-200': 'rgb(var(--color-base-200) / <alpha-value>)',
        'base-300': 'rgb(var(--color-base-300) / <alpha-value>)',
        'base-content': 'rgb(var(--color-base-content) / <alpha-value>)',
        'info': 'rgb(var(--color-info) / <alpha-value>)',
        'success': 'rgb(var(--color-success) / <alpha-value>)',
        'warning': 'rgb(var(--color-warning) / <alpha-value>)',
        'error': 'rgb(var(--color-error) / <alpha-value>)',
        'highlight': 'rgb(var(--color-highlight) / <alpha-value>)',
        'muted': 'rgb(var(--color-muted) / <alpha-value>)',
      },
      scale: {
        '101': '1.01',
      }
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
} satisfies Config;
