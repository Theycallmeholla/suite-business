/**
 * Color utility functions for generating dynamic color schemes
 */

interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  neutral: string;
  neutralLight: string;
  neutralDark: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Lighten a color
 */
function lighten(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.l = Math.min(100, hsl.l + amount);
  
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Darken a color
 */
function darken(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.l = Math.max(0, hsl.l - amount);
  
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Get complementary color
 */
function getComplementary(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.h = (hsl.h + 180) % 360;
  
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Get analogous colors
 */
function getAnalogous(hex: string, degrees: number = 30): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.h = (hsl.h + degrees) % 360;
  
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Get triadic colors
 */
function getTriadic(hex: string, position: 1 | 2): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.h = (hsl.h + (120 * position)) % 360;
  
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Generate a complete color palette from a primary color
 */
export function generateColorPalette(primaryHex: string, industry?: string): ColorPalette {
  // Default color if invalid hex
  if (!hexToRgb(primaryHex)) {
    primaryHex = '#22C55E'; // Default green
  }

  // Adjust color generation based on industry
  let secondaryShift = 120; // Default triadic
  let accentShift = 240; // Default triadic
  
  switch (industry) {
    case 'landscaping':
      secondaryShift = 30; // Analogous warm
      accentShift = -30; // Analogous cool
      break;
    case 'hvac':
      secondaryShift = 180; // Complementary
      accentShift = 90; // Split complementary
      break;
    case 'plumbing':
      secondaryShift = 180; // Complementary
      accentShift = 60; // Offset
      break;
    case 'cleaning':
      secondaryShift = 150; // Cool shift
      accentShift = -150; // Warm shift
      break;
    case 'roofing':
      secondaryShift = 45; // Warm earth tones
      accentShift = -45; // Cool contrast
      break;
    case 'electrical':
      secondaryShift = 60; // Yellow shift
      accentShift = 240; // Blue for contrast
      break;
  }

  const secondary = getAnalogous(primaryHex, secondaryShift);
  const accent = getAnalogous(primaryHex, accentShift);

  return {
    primary: primaryHex,
    primaryLight: lighten(primaryHex, 20),
    primaryDark: darken(primaryHex, 20),
    secondary,
    secondaryLight: lighten(secondary, 20),
    secondaryDark: darken(secondary, 20),
    accent,
    accentLight: lighten(accent, 20),
    accentDark: darken(accent, 20),
    neutral: '#6B7280',
    neutralLight: '#E5E7EB',
    neutralDark: '#374151',
    background: '#FFFFFF',
    foreground: '#111827',
    muted: '#F3F4F6',
    mutedForeground: '#6B7280',
  };
}

/**
 * Generate CSS variables for a color palette
 */
export function generateCSSVariables(palette: ColorPalette): string {
  return `
    --color-primary: ${palette.primary};
    --color-primary-light: ${palette.primaryLight};
    --color-primary-dark: ${palette.primaryDark};
    --color-secondary: ${palette.secondary};
    --color-secondary-light: ${palette.secondaryLight};
    --color-secondary-dark: ${palette.secondaryDark};
    --color-accent: ${palette.accent};
    --color-accent-light: ${palette.accentLight};
    --color-accent-dark: ${palette.accentDark};
    --color-neutral: ${palette.neutral};
    --color-neutral-light: ${palette.neutralLight};
    --color-neutral-dark: ${palette.neutralDark};
    --color-background: ${palette.background};
    --color-foreground: ${palette.foreground};
    --color-muted: ${palette.muted};
    --color-muted-foreground: ${palette.mutedForeground};
  `;
}

/**
 * Industry-specific color schemes
 */
export const industryColorSchemes: Record<string, string> = {
  landscaping: '#22C55E', // Green
  hvac: '#3B82F6', // Blue
  plumbing: '#1E40AF', // Dark Blue
  cleaning: '#06B6D4', // Cyan
  roofing: '#DC2626', // Red
  electrical: '#F59E0B', // Yellow/Amber
  general: '#6B7280', // Gray
};

/**
 * Get default primary color for an industry
 */
export function getIndustryPrimaryColor(industry: string): string {
  return industryColorSchemes[industry] || industryColorSchemes.general;
}