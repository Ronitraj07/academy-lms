/**
 * Academy LMS — Design System Tokens
 * Single source of truth for all design values.
 * Mirrors the CSS custom properties in globals.css.
 *
 * Usage:
 *   import { spacing, radius, shadows } from '@/design-system'
 */

// ---------------------------------------------------------------------------
// Spacing (4px base grid)
// ---------------------------------------------------------------------------
export const spacing = {
  0:  '0px',
  1:  '4px',
  2:  '8px',
  3:  '12px',
  4:  '16px',
  5:  '20px',
  6:  '24px',
  8:  '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  // semantic
  touch:   '44px',
  input:   '48px',
  nav:     '56px',
  sidebar: '288px',
  sidebarCollapsed: '64px',
} as const;

// ---------------------------------------------------------------------------
// Border Radius
// ---------------------------------------------------------------------------
export const radius = {
  none: '0px',
  xs:   '2px',
  sm:   '4px',
  md:   '8px',
  lg:   '12px',
  xl:   '16px',
  '2xl':'20px',
  '3xl':'24px',
  full: '9999px',
} as const;

// ---------------------------------------------------------------------------
// Shadows (Intel 620 safe — blur ≤ 15px)
// ---------------------------------------------------------------------------
export const shadows = {
  xs:      '0 1px 2px 0 rgba(0,0,0,0.05)',
  sm:      '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)',
  md:      '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.05)',
  lg:      '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.05)',
  xl:      '0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)',
  card:    '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)',
  modal:   '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.05)',
  fab:     '0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
  primary: '0 4px 14px rgba(99,102,241,0.3)',
  inner:   'inset 0 2px 4px rgba(0,0,0,0.06)',
  none:    'none',
} as const;

// ---------------------------------------------------------------------------
// Typography — fluid clamp() values
// ---------------------------------------------------------------------------
export const fontSize = {
  xs:   'clamp(0.75rem,  0.7rem   + 0.25vw, 0.875rem)',
  sm:   'clamp(0.875rem, 0.8rem   + 0.35vw, 1rem)',
  base: 'clamp(1rem,     0.95rem  + 0.25vw, 1.0625rem)',
  lg:   'clamp(1.0625rem,1rem     + 0.5vw,  1.25rem)',
  xl:   'clamp(1.125rem, 1rem     + 0.75vw, 1.5rem)',
  '2xl':'clamp(1.25rem,  1.1rem   + 1vw,    1.875rem)',
  '3xl':'clamp(1.5rem,   1.2rem   + 1.5vw,  2.25rem)',
  '4xl':'clamp(1.875rem, 1.4rem   + 2vw,    2.5rem)',
  '5xl':'clamp(2rem,     1.5rem   + 2.5vw,  3rem)',
} as const;

export const fontWeight = {
  normal:    '400',
  medium:    '500',
  semibold:  '600',
  bold:      '700',
  extrabold: '800',
} as const;

export const lineHeight = {
  tight:   '1.2',
  snug:    '1.375',
  normal:  '1.5',
  relaxed: '1.625',
  loose:   '2',
} as const;

// ---------------------------------------------------------------------------
// Breakpoints
// ---------------------------------------------------------------------------
export const breakpoints = {
  xs:  375,   // small phones
  sm:  640,   // large phones
  md:  768,   // tablet portrait
  lg:  1024,  // tablet landscape / laptop
  xl:  1280,  // desktop
  '2xl': 1536,// ultra-wide
} as const;

// ---------------------------------------------------------------------------
// Animation
// ---------------------------------------------------------------------------
export const duration = {
  fast:   '150ms',
  normal: '250ms',
  slow:   '400ms',
} as const;

export const easing = {
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  enter:    'cubic-bezier(0, 0, 0.2, 1)',
  exit:     'cubic-bezier(0.4, 0, 1, 1)',
} as const;

// ---------------------------------------------------------------------------
// Z-Index
// ---------------------------------------------------------------------------
export const zIndex = {
  base:    0,
  raised:  1,
  dropdown: 10,
  sticky:  20,
  overlay: 30,
  modal:   40,
  nav:     50,
  toast:   60,
  tooltip: 70,
  top:     100,
} as const;

// ---------------------------------------------------------------------------
// Component Sizes
// ---------------------------------------------------------------------------
export const componentSizes = {
  navbarHeight:          '56px',
  mobileNavHeight:       '56px',
  sidebarWidth:          '288px',
  sidebarWidthCollapsed: '64px',
  inputMinHeight:        '48px',
  touchTarget:           '44px',
} as const;

// ---------------------------------------------------------------------------
// Semantic Color Names (maps to CSS vars in globals.css)
// ---------------------------------------------------------------------------
export const semanticColors = {
  background:      'hsl(var(--background))',
  foreground:      'hsl(var(--foreground))',
  card:            'hsl(var(--card))',
  cardForeground:  'hsl(var(--card-foreground))',
  primary:         'hsl(var(--primary))',
  primaryFg:       'hsl(var(--primary-foreground))',
  muted:           'hsl(var(--muted))',
  mutedFg:         'hsl(var(--muted-foreground))',
  border:          'hsl(var(--border))',
  destructive:     'hsl(var(--destructive))',
  success:         'hsl(var(--success))',
  warning:         'hsl(var(--warning))',
  info:            'hsl(var(--info))',
  // surface aliases
  surface:         'hsl(var(--background))',
  surfaceRaised:   'hsl(var(--card))',
  surfaceOverlay:  'hsl(var(--popover))',
  surfaceSunken:   'hsl(var(--muted))',
} as const;
