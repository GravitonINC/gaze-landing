# Gaze Landing Page — Technical Architecture

> Architecture decision record for gazeprotocol.com.
> Issue: GravitonINC/gaze-agents#426
> Author: Architect agent
> Date: 2026-03-23
> Status: **APPROVED** — ready for implementation

---

## 1. Decision Summary

| Decision | Choice | Rationale |
|---|---|---|
| Framework | **Astro 5** | Zero JS by default, partial hydration via islands, best static site perf |
| UI Islands | **React 19** (via `@astrojs/react`) | Team familiarity, ecosystem, design system compatibility |
| Styling | **Tailwind CSS v4** + CSS custom properties | Utility-first, design token integration, tree-shaking |
| Deployment | **Vercel** (static adapter) | Already configured in repo registry, preview deploys per PR, edge CDN |
| Language | **TypeScript** (strict mode) | Consistency with gaze-agents, type safety |
| Package Manager | **pnpm** | Faster installs, strict dependency resolution, workspace support |
| CI/CD | **GitHub Actions** | Lint → Type check → Build → Lighthouse CI → Vercel deploy |
| Performance Target | **Lighthouse > 90** all categories | P0 requirement from directive |

---

## 2. Framework: Astro 5

### Why Astro

Astro is a content-focused framework that ships zero JavaScript by default. For a marketing landing page, this is the correct architecture:

- **Zero JS baseline.** Static HTML + CSS ships by default. No React runtime, no hydration cost.
- **Islands architecture.** Interactive components (e.g., token price ticker, wallet connect) hydrate independently via `client:load` or `client:visible` directives.
- **Content collections.** Type-safe content management for FAQ, feature sections, etc.
- **Built-in optimizations.** Image optimization (`astro:assets`), CSS scoping, automatic code splitting.
- **SSG output.** Pre-renders to static HTML at build time. No server runtime needed.

### Why Not Next.js

Next.js ships the React runtime (~85KB gzipped) even for static pages. For a marketing site with minimal interactivity, this is unnecessary weight. Next.js excels at dynamic apps — not static landing pages.

### Why Not Plain HTML/CSS

No component reuse, no type safety, no build-time optimization, no image pipeline. The site has enough structure (sections, components, responsive layouts) to justify a framework.

### Why Not Remix/SvelteKit/Nuxt

- Remix: Server-focused, overkill for static content.
- SvelteKit: Viable but team has no Svelte experience. React islands in Astro give us React familiarity with Astro's static performance.
- Nuxt: Vue ecosystem, team uses React.

---

## 3. Styling: Tailwind CSS v4

### Configuration

```ts
// tailwind.config.ts — Tailwind v4 uses CSS-first config
// Most config lives in src/styles/global.css via @theme

export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
}
```

### Design Tokens

Design tokens from the Gaze design system (skills/designer/design-system/SKILL.md) map to CSS custom properties:

```css
/* src/styles/tokens.css */
@theme {
  /* Colors — Gaze palette */
  --color-ember: #FF6B35;
  --color-ember-glow: #FF8F5E;
  --color-deep-black: #0A0A0A;
  --color-warm-gray: #1A1A1A;
  --color-soft-white: #F5F0EB;
  --color-gold-accent: #C9A84C;

  /* Typography */
  --font-display: 'Editorial New', Georgia, serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing scale */
  --spacing-section: 120px;
  --spacing-section-mobile: 64px;

  /* Animation */
  --ease-smooth: cubic-bezier(0.25, 0.1, 0.25, 1);
  --duration-slow: 800ms;
  --duration-medium: 400ms;
  --duration-fast: 150ms;
}
```

> **Note:** Exact color values, font choices, and spacing will be finalized by Designer.
> The above are representative based on the design system. Builder should reference
> the Designer's design direction document for final values.

### Grain Overlay

The Gaze aesthetic uses a subtle film grain texture overlay. Implementation:

```css
/* Applied via a pseudo-element on body or section backgrounds */
.grain::after {
  content: '';
  position: fixed;
  inset: 0;
  opacity: 0.03;
  background-image: url('/textures/grain.svg');
  pointer-events: none;
  z-index: 9999;
}
```

---

## 4. Repository Structure

```
gaze-landing/
├── .github/
│   └── workflows/
│       ├── ci.yml              # Lint + type check + build + Lighthouse
│       └── deploy.yml          # Vercel deployment (auto on main)
├── docs/
│   └── ARCHITECTURE.md         # This document
├── public/
│   ├── fonts/                  # Self-hosted web fonts (WOFF2)
│   ├── textures/               # Grain overlay, noise patterns
│   ├── og/                     # Open Graph images
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── assets/                 # Images processed by astro:assets
│   │   ├── hero/
│   │   └── icons/
│   ├── components/             # Reusable UI components
│   │   ├── Button.astro
│   │   ├── Card.astro
│   │   ├── Nav.astro
│   │   ├── Footer.astro
│   │   └── ...
│   ├── islands/                # React islands (interactive components)
│   │   ├── TokenTicker.tsx     # Live price display (client:visible)
│   │   ├── WalletConnect.tsx   # Wallet connection (client:load)
│   │   └── ...
│   ├── layouts/
│   │   └── Base.astro          # HTML shell, meta, fonts, grain overlay
│   ├── pages/
│   │   ├── index.astro         # Landing page
│   │   ├── privacy.astro       # Privacy policy (if needed)
│   │   └── terms.astro         # Terms of service (if needed)
│   ├── sections/               # Page sections (composed in pages)
│   │   ├── Hero.astro
│   │   ├── HowItWorks.astro
│   │   ├── ForWatchers.astro
│   │   ├── ForCreators.astro
│   │   ├── ForStakers.astro
│   │   ├── Stats.astro
│   │   ├── Leaderboard.astro
│   │   └── CTA.astro
│   └── styles/
│       ├── global.css          # Tailwind directives + base styles
│       └── tokens.css          # Design tokens as CSS custom properties
├── CLAUDE.md                   # Agent coding conventions
├── astro.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── pnpm-lock.yaml
```

### Key Conventions

- **Components** (`.astro`): Static, zero-JS components. Used for layout, typography, cards.
- **Islands** (`.tsx`): React components that need interactivity. Hydrated via Astro directives.
- **Sections**: Full-width page sections composed from components. Each section is self-contained.
- **No `src/lib/` or `src/utils/`** until needed. Don't pre-create empty directories.

---

## 5. TypeScript Configuration

```jsonc
// tsconfig.json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "verbatimModuleSyntax": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@sections/*": ["src/sections/*"],
      "@islands/*": ["src/islands/*"],
      "@styles/*": ["src/styles/*"],
      "@assets/*": ["src/assets/*"]
    }
  }
}
```

---

## 6. Astro Configuration

```ts
// astro.config.ts
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://gazeprotocol.com',
  output: 'static',
  integrations: [
    react(),
    tailwind(),
    sitemap(),
  ],
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
  vite: {
    build: {
      cssMinify: 'lightningcss',
    },
  },
});
```

---

## 7. CI/CD Pipeline

### GitHub Actions: CI

```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm run lint          # ESLint
      - run: pnpm run typecheck     # tsc --noEmit
      - run: pnpm run build         # astro build
      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v12
        with:
          configPath: .lighthouserc.json
          uploadArtifacts: true
```

### Lighthouse CI Config

```jsonc
// .lighthouserc.json
{
  "ci": {
    "collect": {
      "staticDistDir": "dist",
      "url": ["/"]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }]
      }
    }
  }
}
```

### Deployment: Vercel

- **Production:** Auto-deploy on push to `main`
- **Preview:** Auto-deploy on every PR (Vercel GitHub integration)
- **Adapter:** `@astrojs/vercel/static` — pre-renders to static files, served from Vercel edge CDN
- **Build command:** `pnpm run build`
- **Output directory:** `dist`
- **Node version:** 20

The repo is already registered in the agent system as `gaze-landing` with `deployment_type: vercel`.

---

## 8. Performance Targets

| Metric | Target | Enforcement |
|---|---|---|
| Lighthouse Performance | > 90 | CI gate (blocks merge) |
| Lighthouse Accessibility | > 90 | CI gate (blocks merge) |
| Lighthouse Best Practices | > 90 | CI gate (blocks merge) |
| Lighthouse SEO | > 90 | CI gate (blocks merge) |
| First Contentful Paint | < 1.2s | Lighthouse CI |
| Largest Contentful Paint | < 2.5s | Lighthouse CI |
| Total Blocking Time | < 200ms | Lighthouse CI |
| Cumulative Layout Shift | < 0.1 | Lighthouse CI |
| Total JS (gzipped) | < 50KB | Manual review |
| Total CSS (gzipped) | < 20KB | Manual review |

### Performance Rules

1. **No client-side JS unless interactive.** Default to `.astro` components. Only use React islands for components that need state or event handlers.
2. **Self-host fonts.** WOFF2 format, `font-display: swap`, preloaded in `<head>`.
3. **Optimize images.** Use `astro:assets` for automatic WebP/AVIF conversion and responsive srcsets.
4. **No third-party scripts in initial load.** Analytics (if any) loads after `DOMContentLoaded`.
5. **Preconnect to API domains.** `<link rel="preconnect" href="https://api.gazeprotocol.com">` if live data is used.

---

## 9. Dependencies (Initial)

### Production

| Package | Version | Purpose |
|---|---|---|
| `astro` | `^5.x` | Framework |
| `@astrojs/react` | `^4.x` | React island integration |
| `@astrojs/tailwind` | `^6.x` | Tailwind integration |
| `@astrojs/sitemap` | `^3.x` | Sitemap generation |
| `react` | `^19.x` | Island runtime |
| `react-dom` | `^19.x` | Island runtime |
| `tailwindcss` | `^4.x` | Styling |

### Development

| Package | Version | Purpose |
|---|---|---|
| `typescript` | `^5.x` | Type checking |
| `eslint` | `^9.x` | Linting |
| `@typescript-eslint/parser` | `^8.x` | TS linting |
| `prettier` | `^3.x` | Formatting |
| `prettier-plugin-astro` | `^0.x` | Astro formatting |
| `@lhci/cli` | `^0.x` | Lighthouse CI |

### Dependency Rules

- **No animation libraries** (Framer Motion, GSAP) unless a specific interaction requires it. CSS animations first.
- **No state management** (Redux, Zustand). Islands manage their own local state.
- **No CSS-in-JS** (styled-components, Emotion). Tailwind + CSS custom properties only.
- **No heavy icon libraries.** Inline SVGs or a minimal icon sprite.

---

## 10. PR Ship Order

Builder should implement in this order. Each PR is independently deployable.

| PR | Scope | Description | Depends On |
|---|---|---|---|
| **1. Scaffold** | Foundation | Astro project init, Tailwind config, TypeScript config, CI workflow, Base layout, design tokens, CLAUDE.md | — |
| **2. Hero** | Section | Hero section with Burning Eye visual, headline, subheadline, primary CTA | PR 1 |
| **3. Content Sections** | Sections | How It Works, For Watchers, For Creators, For Stakers sections | PR 1 |
| **4. Stats + Leaderboard** | Section | Platform stats display, leaderboard preview (can be static initially) | PR 1 |
| **5. CTA + Footer** | Sections | Final CTA section, footer with links, legal, social | PR 1 |
| **6. Navigation** | Component | Responsive nav bar, mobile menu, scroll behavior | PR 1 |
| **7. Polish + Performance** | Quality | Animation polish, Lighthouse optimization, OG images, final QA | PRs 2-6 |

### Review Gate

**Architect reviews ALL PRs.** Nothing merges without an `## Architect Review [APPROVED]` comment. Designer reviews PRs 2-7 for design system compliance.

---

## 11. SEO & Meta

```astro
<!-- Base.astro layout -->
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Gaze Protocol — Your Attention, Valued</title>
  <meta name="description" content="Your attention is already valuable. Gaze is an attention rewards protocol on Solana where watchers earn, creators launch tokens, and stakers earn options every second." />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Gaze Protocol" />
  <meta property="og:description" content="Your attention is already valuable. Now you get to keep it." />
  <meta property="og:image" content="/og/gaze-og.png" />
  <meta property="og:url" content="https://gazeprotocol.com" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Gaze Protocol" />
  <meta name="twitter:description" content="Your attention is already valuable. Now you get to keep it." />
  <meta name="twitter:image" content="/og/gaze-og.png" />

  <!-- Preload fonts -->
  <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin />

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

  <!-- Sitemap -->
  <link rel="sitemap" href="/sitemap-index.xml" />
</head>
```

---

## 12. Rejected Alternatives

| Alternative | Why Rejected |
|---|---|
| **Next.js** | Ships React runtime (~85KB) for static pages. Overkill for a marketing site. |
| **Cloudflare Pages** | Weaker Astro integration, team already uses Vercel. |
| **Monorepo (in gaze-agents)** | Different deps, deploy target, and release cadence. Separate repo is cleaner. |
| **SPA (React/Vue)** | Bad for SEO, bad for performance, unnecessary for static content. |
| **WordPress/Webflow** | No type safety, no version control, no CI/CD, no code ownership. |
| **Hugo/11ty** | No component model, no TypeScript, limited interactivity options. |
| **CSS Modules** | Tailwind is more productive for rapid landing page development. |

---

## 13. Open Questions

These need resolution before or during implementation:

1. **DNS:** Is gazeprotocol.com DNS managed? Vercel needs CNAME/A record configuration.
2. **Analytics:** Do we need analytics? If so, Plausible (privacy-first) or Vercel Analytics?
3. **Legal pages:** Privacy policy and terms of service — who provides the content?
4. **Live data:** Should Stats section pull live on-chain data (TVL, volume) or use static placeholders initially?
5. **Fonts:** Final font selection from Designer — are we self-hosting or using a CDN?
6. **OG images:** Static or dynamically generated per-page?

---

*Architecture decision by Architect agent. Reference issue: GravitonINC/gaze-agents#426.*
