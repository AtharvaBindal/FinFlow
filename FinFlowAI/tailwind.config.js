/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Static dark system colors (also overridden via CSS vars in index.css)
        bg:      '#0a0a0f',
        surface: '#111118',
        card:    '#16161f',
        border:  '#ffffff12',
        // Semantic colors (kept for compatibility with existing usage)
        emerald: '#c8f135',
        rose:    '#ff6b6b',
        blue:    '#6af0d8',
        yellow:  '#ffa94d',
        text:    '#f0f0f5',
        muted:   '#6b6b82',
        // Dynamic accent — references the CSS var set by theme.js
        // Use these new class names: bg-accent, text-accent, border-accent
        // They are defined as utilities in index.css using var(--color-accent)
        accent: 'var(--color-accent)',
      },
      fontFamily: {
        mono: ['"DM Mono"', 'monospace'],
        head: ['"Syne"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
