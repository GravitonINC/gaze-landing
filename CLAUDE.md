# CLAUDE.md — gaze-landing

> Coding conventions and architectural decisions for the Gaze Protocol landing page.
> Read docs/ARCHITECTURE.md for the full architecture decision record.

## Project Overview

Static marketing landing page for gazeprotocol.com. Built with Astro 5, React islands, Tailwind CSS v4, deployed to Vercel.

## Tech Stack

- **Framework:** Astro 5 (static output, zero JS by default)
- **Islands:** React 19 via `@astrojs/react` (only for interactive components)
- **Styling:** Tailwind CSS v4 + CSS custom properties (design tokens in `src/styles/tokens.css`)
- **Language:** TypeScript (strict mode, Astro strict preset)
- **Package Manager:** pnpm
- **Deployment:** Vercel (static adapter)

## Commands

```bash
pnpm install          # Install dependencies
pnpm run dev          # Start dev server (localhost:4321)
pnpm run build        # Production build to dist/
pnpm run preview      # Preview production build
pnpm run lint         # ESLint
pnpm run typecheck    # tsc --noEmit
```

## Architecture Decisions

### Components vs Islands

- **`.astro` components** — Default choice. Static HTML, zero JS. Use for layout, typography, cards, sections.
- **`.tsx` React islands** — Only when the component needs state, event handlers, or client-side interactivity. Place in `src/islands/`. Hydrate with `client:load` (immediate) or `client:visible` (lazy).

**Rule:** If it doesn't need JavaScript, it's an `.astro` component. Period.

### File Organization

```
src/
  components/   → Reusable UI components (.astro)
  islands/      → React interactive components (.tsx)
  sections/     → Full-width page sections (.astro)
  layouts/      → HTML shell, head, body wrapper
  pages/        → Route pages (index.astro, etc.)
  styles/       → Global CSS, design tokens
  assets/       → Images (processed by astro:assets)
```

### Styling Rules

1. Use Tailwind utility classes for all styling.
2. Design tokens are CSS custom properties defined in `src/styles/tokens.css`.
3. Reference tokens via Tailwind: `text-[var(--color-ember)]` or configure in tailwind theme.
4. No CSS-in-JS. No styled-components. No Emotion.
5. No `!important` unless overriding third-party styles (document why).
6. Grain overlay is applied via `.grain::after` pseudo-element on the body.

### TypeScript Rules

1. Strict mode enabled (Astro strict preset + additional strict options).
2. Use path aliases: `@/`, `@components/`, `@sections/`, `@islands/`, `@styles/`, `@assets/`.
3. No `any` types. Use `unknown` and narrow.
4. `import type` for type-only imports.

### Performance Rules

1. Total JS budget: < 50KB gzipped.
2. Total CSS budget: < 20KB gzipped.
3. Self-host fonts (WOFF2, `font-display: swap`).
4. Use `astro:assets` for all images (automatic optimization).
5. No third-party scripts in initial page load.
6. Lighthouse > 90 all categories (enforced by CI).

### Content Rules

1. All copy follows Gaze brand voice: warm restraint, candlelit gallery aesthetic.
2. No hype language. No "LFG", "moon", "NFA", "DYOR".
3. No financial promises or APY claims.
4. Factual, precise, honest.

## Patterns

### Section Component Pattern

```astro
---
// src/sections/Example.astro
interface Props {
  id?: string;
}
const { id } = Astro.props;
---

<section id={id} class="py-[var(--spacing-section)] md:py-[var(--spacing-section-mobile)]">
  <div class="mx-auto max-w-6xl px-6">
    <!-- Section content -->
  </div>
</section>
```

### React Island Pattern

```tsx
// src/islands/Example.tsx
interface Props {
  initialValue: string;
}

export default function Example({ initialValue }: Props) {
  const [value, setValue] = useState(initialValue);
  return <div>{value}</div>;
}
```

Usage in Astro:
```astro
---
import Example from '@islands/Example';
---
<Example client:visible initialValue="hello" />
```

## Gotchas

- Astro components use `.astro` extension with frontmatter (`---`) blocks, not JSX.
- React islands MUST have a `client:*` directive or they render as static HTML (no hydration).
- `client:visible` is preferred over `client:load` for below-fold interactive components.
- Tailwind v4 uses CSS-first configuration (`@theme` in CSS), not `tailwind.config.ts` for most settings.
- Image imports in Astro use `import img from '@assets/hero.png'` + `<Image src={img} alt="..." />`.

## Review Gate

All PRs require Architect review (`## Architect Review [APPROVED]`). PRs touching visual components also require Designer review.
