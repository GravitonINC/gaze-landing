import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Core palette — Ember Gallery aesthetic
        gaze: {
          // Backgrounds
          'bg-base': 'var(--color-bg-base)',
          'bg-surface': 'var(--color-bg-surface)',
          'bg-elevated': 'var(--color-bg-elevated)',
          'bg-overlay': 'var(--color-bg-overlay)',

          // Foregrounds
          'fg-primary': 'var(--color-fg-primary)',
          'fg-secondary': 'var(--color-fg-secondary)',
          'fg-muted': 'var(--color-fg-muted)',
          'fg-subtle': 'var(--color-fg-subtle)',

          // Brand
          'ember': 'var(--color-ember)',
          'ember-dim': 'var(--color-ember-dim)',
          'ember-glow': 'var(--color-ember-glow)',

          // Borders
          'border': 'var(--color-border)',
          'border-subtle': 'var(--color-border-subtle)',
        },
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      fontSize: {
        // Display scale
        'display-xl': ['clamp(3rem, 8vw, 6rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2.25rem, 5vw, 4rem)', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(1.75rem, 3.5vw, 2.75rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        // Body scale
        'body-xl': ['1.25rem', { lineHeight: '1.6' }],
        'body-lg': ['1.125rem', { lineHeight: '1.65' }],
        'body-md': ['1rem', { lineHeight: '1.7' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6' }],
        'body-xs': ['0.75rem', { lineHeight: '1.5' }],
        // Label scale
        'label-lg': ['0.875rem', { lineHeight: '1', letterSpacing: '0.08em' }],
        'label-md': ['0.75rem', { lineHeight: '1', letterSpacing: '0.1em' }],
        'label-sm': ['0.6875rem', { lineHeight: '1', letterSpacing: '0.12em' }],
      },
      spacing: {
        // Section spacing
        'section-sm': 'var(--spacing-section-sm)',
        'section-md': 'var(--spacing-section-md)',
        'section-lg': 'var(--spacing-section-lg)',
        'section-xl': 'var(--spacing-section-xl)',
      },
      maxWidth: {
        'content': '1200px',
        'prose': '680px',
        'narrow': '480px',
      },
      borderRadius: {
        'card': 'var(--radius-card)',
        'pill': 'var(--radius-pill)',
      },
      boxShadow: {
        'ember': 'var(--shadow-ember)',
        'card': 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
      },
      animation: {
        'ember-pulse': 'ember-pulse 3s ease-in-out infinite',
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
      },
      keyframes: {
        'ember-pulse': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      transitionTimingFunction: {
        'gaze': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
