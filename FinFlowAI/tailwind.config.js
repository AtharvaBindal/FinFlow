/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dynamic system colors mapped to CSS variables
        bg:      'var(--color-bg)',
        surface: 'var(--color-surface)',
        card:    'var(--color-card)',
        border:  'var(--color-border)',
        
        // Semantic colors mapped to CSS variables
        rose:    'var(--color-rose)',
        blue:    'var(--color-blue)',
        text:    'var(--color-text)',
        muted:   'var(--color-muted)',
        accent:  'var(--color-accent)',
        
        // Aliasing legacy colors to the unified theme
        emerald: 'var(--color-accent)',
        yellow:  'var(--color-accent)',
      },
      fontFamily: {
        mono: ['"DM Mono"', 'monospace'],
        head: ['"Syne"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
