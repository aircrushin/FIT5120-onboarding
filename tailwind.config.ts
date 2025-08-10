import type { Config } from 'tailwindcss';
const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");
const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

export default {
  content: ['./app/**/*.{ts,tsx}', './content/**/*.mdx', './public/**/*.svg', './components/**/*.{ts,tsx}'],
  darkMode: "class",
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
        // shadcn/ui colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        'primary-foreground': "hsl(var(--primary-foreground))",
        'secondary-foreground': "hsl(var(--secondary-foreground))",
        'muted-foreground': "hsl(var(--muted-foreground))",
        'accent-foreground': "hsl(var(--accent-foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      scale: {
        '101': '1.01',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [addVariablesForColors],
} satisfies Config;

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}
