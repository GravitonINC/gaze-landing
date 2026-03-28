# Geist Font Files

This directory must contain the Geist variable font files for the Gaze landing page.

## Required Files

- `GeistVariableVF.woff2` — Geist sans-serif variable font (weight 100–900)
- `GeistMonoVariableVF.woff2` — Geist Mono variable font (weight 100–900)

## Download

Download from the official Vercel Geist font releases:
https://github.com/vercel/geist-font/releases

Look for the latest release and download the `.woff2` variable font files.

## Why Self-Hosted?

Geist is not available on Google Fonts or other CDNs. Self-hosting ensures:
- No third-party requests (privacy)
- Faster load times (no DNS lookup)
- Reliable availability

## Font Face Declarations

These files are referenced in `src/styles/fonts.css`:

```css
@font-face {
  font-family: 'Geist';
  src: url('/fonts/geist/GeistVariableVF.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Geist Mono';
  src: url('/fonts/geist/GeistMonoVariableVF.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
```
