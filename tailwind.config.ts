import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Themed colors — plain var(), no alpha modifier needed
        bg:       'var(--c-bg)',
        surface:  'var(--c-surface)',
        surface2: 'var(--c-surface2)',
        border:   'var(--c-border)',
        text:     'var(--c-text)',
        muted:    'var(--c-muted)',
        subtle:   'var(--c-subtle)',
        // Static colors — channel format supports bg-accent/10 etc.
        accent:       'rgb(var(--c-accent-ch) / <alpha-value>)',
        'accent-dim': 'rgb(var(--c-accent-dim-ch) / <alpha-value>)',
        orange:       'rgb(var(--c-orange-ch) / <alpha-value>)',
        success:      'rgb(var(--c-success-ch) / <alpha-value>)',
        warning:      'rgb(var(--c-warning-ch) / <alpha-value>)',
        danger:       'rgb(var(--c-danger-ch) / <alpha-value>)',
      },
      fontFamily: {
        mono: ['Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow:          '0 0 20px rgba(20,184,166,0.3)',
        'glow-sm':     '0 0 10px rgba(20,184,166,0.2)',
        'glow-orange': '0 0 20px rgba(249,115,22,0.3)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
        tick:         'tick 1s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 10px rgba(20,184,166,0.2)' },
          '50%':     { boxShadow: '0 0 25px rgba(20,184,166,0.5)' },
        },
        fadeIn:  { from: { opacity: '0' },                               to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        tick:    { '0%,100%': { transform: 'scale(1)' },                 '50%': { transform: 'scale(1.05)' } },
      },
    },
  },
  plugins: [],
} satisfies Config
