/**
 * Theme Generator — generates a full CSS variable palette from one base accent color.
 * All returned values are HSL strings suitable for CSS vars.
 */

/** Convert hex to HSL */
function hexToHSL(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/** Clamp a number between min and max */
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/**
 * Generate a complete CSS variable palette from a hex accent color.
 * Returns an object of { '--var-name': 'value' } pairs.
 * @param {string} hex - e.g. '#c8f135'
 */
export function generatePalette(hex) {
  const { h, s } = hexToHSL(hex);

  // Accent: use the chosen color directly as-is
  const accent     = `hsl(${h}, ${s}%, 62%)`;    // Main accent (vibrant)
  const accentDim  = `hsl(${h}, ${s}%, 35%)`;    // Dimmer accent (darker on-accent text bg)
  const accentGlow = `hsl(${h}, ${s}%, 62%, 0.3)`;  // Glow shadow

  // Background stays very dark but shifts hue slightly toward the accent
  const bgH = h;
  const bg       = `hsl(${bgH}, 18%, 5%)`;       // Main background
  const surface  = `hsl(${bgH}, 15%, 8%)`;       // Cards / surfaces
  const card     = `hsl(${bgH}, 14%, 10%)`;      // Inner cards
  const border   = `hsl(${bgH}, 20%, 100%, 0.08)`;  // Borders (subtle)

  // Text
  const textColor = `hsl(${h}, 10%, 94%)`;
  const muted     = `hsl(${h}, 12%, 50%)`;

  // Complementary semantic colors (shifted hue from accent)
  const rose   = `hsl(${(h + 160) % 360}, 85%, 65%)`;   // "Danger" / overspend
  const blue   = `hsl(${(h + 120) % 360}, 75%, 70%)`;   // "Info"
  const yellow = `hsl(${(h + 40)  % 360}, 90%, 65%)`;   // "Warning"

  return {
    '--color-accent':       accent,
    '--color-accent-dim':   accentDim,
    '--color-accent-glow':  accentGlow,
    '--color-bg':           bg,
    '--color-surface':      surface,
    '--color-card':         card,
    '--color-border':       border,
    '--color-text':         textColor,
    '--color-muted':        muted,
    '--color-rose':         rose,
    '--color-blue':         blue,
    '--color-yellow':       yellow,
    '--color-h':            String(h),
    '--color-s':            `${s}%`,
  };
}

/**
 * Apply a palette to document.documentElement CSS custom properties.
 * @param {string} hex
 */
export function applyTheme(hex) {
  if (!hex || hex.length < 7) return;
  const palette = generatePalette(hex);
  Object.entries(palette).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
}

/** Preset brand colors with names */
export const PRESET_COLORS = [
  { name: 'Lime (Default)', hex: '#c8f135' },
  { name: 'Electric Blue',  hex: '#38bdf8' },
  { name: 'Neon Pink',      hex: '#f471b5' },
  { name: 'Cyber Purple',   hex: '#a855f7' },
  { name: 'Sunset Orange',  hex: '#fb923c' },
  { name: 'Mint Green',     hex: '#34d399' },
  { name: 'Gold',           hex: '#fbbf24' },
  { name: 'Crimson',        hex: '#f43f5e' },
];
