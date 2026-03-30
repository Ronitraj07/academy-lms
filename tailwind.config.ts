import type { Config } from "tailwindcss"

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    // 2.8 — explicit breakpoint system matching tokens.ts
    screens: {
      xs:   '375px',   // Small phones
      sm:   '640px',   // Large phones
      md:   '768px',   // Tablet portrait
      lg:   '1024px',  // Tablet landscape + laptop
      xl:   '1280px',  // Desktop
      '2xl':'1536px',  // Ultra-wide
    },
    extend: {
      colors: {
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT:    "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning:  "hsl(var(--warning))",
        info:     "hsl(var(--info))",
        // 2.5 — semantic surface aliases as Tailwind utilities
        surface: {
          DEFAULT: "hsl(var(--background))",
          raised:  "hsl(var(--card))",
          overlay: "hsl(var(--popover))",
          sunken:  "hsl(var(--muted))",
        },
      },
      borderRadius: {
        // 2.4 — full radius token set (previously only 3 values)
        none: '0px',
        xs:   '2px',
        sm:   '4px',
        DEFAULT:'8px',
        md:   '8px',
        lg:   '12px',
        xl:   '16px',
        '2xl':'20px',
        '3xl':'24px',
        full: '9999px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        // 2.1 — fluid type scale registered as Tailwind utilities
        // Use these instead of raw text-sm / text-xl etc for fluid behavior
        'fluid-xs':  ['clamp(0.75rem,  0.7rem  + 0.25vw, 0.875rem)',  { lineHeight: '1.5' }],
        'fluid-sm':  ['clamp(0.875rem, 0.8rem  + 0.35vw, 1rem)',      { lineHeight: '1.5' }],
        'fluid-base':['clamp(1rem,     0.95rem + 0.25vw, 1.0625rem)', { lineHeight: '1.6' }],
        'fluid-lg':  ['clamp(1.0625rem,1rem    + 0.5vw,  1.25rem)',   { lineHeight: '1.55'}],
        'fluid-xl':  ['clamp(1.125rem, 1rem    + 0.75vw, 1.5rem)',    { lineHeight: '1.4' }],
        'fluid-2xl': ['clamp(1.25rem,  1.1rem  + 1vw,    1.875rem)',  { lineHeight: '1.3' }],
        'fluid-3xl': ['clamp(1.5rem,   1.2rem  + 1.5vw,  2.25rem)',   { lineHeight: '1.25'}],
        'fluid-4xl': ['clamp(1.875rem, 1.4rem  + 2vw,    2.5rem)',    { lineHeight: '1.2' }],
        'fluid-5xl': ['clamp(2rem,     1.5rem  + 2.5vw,  3rem)',      { lineHeight: '1.15'}],
      },
      spacing: {
        // 2.2 — named spacing aliases for semantic clarity
        'touch': '44px',  // minimum touch target
        'input': '48px',  // minimum input height
        'nav':   '56px',  // navbar + mobile nav height
        'sidebar':'288px',// sidebar expanded width
        'sidebar-collapsed':'64px',
      },
      boxShadow: {
        // 2.3 — shadow system, safe for Intel 620 (no heavy blur)
        'card':     '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-hover':'0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.05)',
        'modal':    '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.05)',
        'sidebar':  '4px 0 8px rgba(0,0,0,0.06)',
        'navbar':   '0 1px 3px rgba(0,0,0,0.08)',
        'fab':      '0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
        'primary':  '0 4px 14px rgba(99,102,241,0.3)',
        'inner':    'inset 0 2px 4px rgba(0,0,0,0.06)',
        'none':     'none',
      },
      backdropBlur: {
        // 2.6 — capped at 8px for Intel 620 perf
        xs:  '2px',
        sm:  '4px',
        DEFAULT: '8px',
        md:  '8px',
        lg:  '12px', // use only for modals where it's truly needed
      },
      transitionTimingFunction: {
        'standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'enter':    'cubic-bezier(0, 0, 0.2, 1)',
        'exit':     'cubic-bezier(0.4, 0, 1, 1)',
      },
      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        // New keyframes — added in Phase 2
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        'skeleton': {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'accordion-down':  'accordion-down 0.2s ease-out',
        'accordion-up':    'accordion-up 0.2s ease-out',
        'fade-up':         'fade-up 0.25s cubic-bezier(0, 0, 0.2, 1)',
        'fade-in':         'fade-in 0.2s cubic-bezier(0, 0, 0.2, 1)',
        'slide-in-left':   'slide-in-left 0.25s cubic-bezier(0, 0, 0.2, 1)',
        'slide-in-right':  'slide-in-right 0.25s cubic-bezier(0, 0, 0.2, 1)',
        'scale-in':        'scale-in 0.2s cubic-bezier(0, 0, 0.2, 1)',
        'pulse-soft':      'pulse-soft 2s ease-in-out infinite',
        'skeleton':        'skeleton 1.5s ease-in-out infinite',
        'spin-slow':       'spin 3s linear infinite',
      },
      zIndex: {
        '1':  '1',
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100':'100',
      },
    },
  },
  plugins: [],
} satisfies Config
