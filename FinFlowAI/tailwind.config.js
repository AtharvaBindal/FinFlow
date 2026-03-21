/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        surface: '#111118',
        card: '#16161f',
        border: '#ffffff12',
        emerald: '#c8f135',
        rose: '#ff6b6b',
        blue: '#6af0d8',
        yellow: '#ffa94d',
        text: '#f0f0f5',
        muted: '#6b6b82'
      },
      fontFamily: {
        mono: ['"DM Mono"', 'monospace'],
        head: ['"Syne"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
