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


/**
 * Generate a complete CSS variable palette from a hex accent color.
 * Returns an object of { '--var-name': 'value' } pairs.
 * @param {string} hex - e.g. '#c8f135'
 */
export function generatePalette(hex, isLight = false) {
  const { h, s } = hexToHSL(hex);

  // Accent: use the chosen color directly as-is
  const accent     = `hsl(${h}, ${Math.min(s, 70)}%, ${isLight ? '65%' : '65%'})`;    // Main accent (softer)
  const accentDim  = `hsl(${h}, ${Math.min(s, 60)}%, ${isLight ? '85%' : '35%'})`;    // Dimmer accent (lighter in light mode for subtle bg)
  const accentGlow = `hsl(${h}, ${Math.min(s, 50)}%, 70%, 0.2)`;  // Glow shadow

  // Background shifts hue slightly toward the accent
  const bgH = h;
  const bg       = isLight ? `hsl(${bgH}, 12%, 98%)` : `hsl(${bgH}, 18%, 8%)`;       
  const surface  = isLight ? `hsl(${bgH}, 12%, 100%)` : `hsl(${bgH}, 15%, 11%)`;       
  const card     = isLight ? `hsl(${bgH}, 12%, 95%)` : `hsl(${bgH}, 14%, 13%)`;      
  const border   = isLight ? `hsl(${bgH}, 12%, 0%, 0.08)` : `hsl(${bgH}, 20%, 100%, 0.08)`;  

  // Text
  const textColor = isLight ? `hsl(${bgH}, 10%, 25%)` : `hsl(${h}, 5%, 90%)`;
  const muted     = isLight ? `hsl(${bgH}, 10%, 55%)` : `hsl(${h}, 8%, 55%)`;

  // Complementary semantic colors (shifted hue from accent, softened)
  const rose   = `hsl(${(h + 160) % 360}, 75%, 70%)`;   // "Danger" / overspend
  const blue   = `hsl(${(h + 120) % 360}, 65%, 75%)`;   // "Info"
  const yellow = `hsl(${(h + 40)  % 360}, 80%, 70%)`;   // "Warning"

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
 * @param {boolean} isLight
 */
export function applyTheme(hex, isLight = false) {
  if (!hex || hex.length < 7) return;
  const palette = generatePalette(hex, isLight);
  Object.entries(palette).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
}

/** Preset brand colors with names */
export const PRESET_COLORS = [
  { name: 'Lavender (Default)', hex: '#a74ac9' },
  { name: 'Lime',           hex: '#c8f135' },
  { name: 'Electric Blue',  hex: '#38bdf8' },
  { name: 'Neon Pink',      hex: '#f471b5' },
  { name: 'Cyber Purple',   hex: '#a855f7' },
  { name: 'Sunset Orange',  hex: '#fb923c' },
  { name: 'Mint Green',     hex: '#34d399' },
  { name: 'Gold',           hex: '#fbbf24' },
  { name: 'Crimson',        hex: '#f43f5e' },
];
