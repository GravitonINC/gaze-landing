# gaze-landing

Gaze Protocol landing page — static marketing site built with Astro.

## Tech Stack

- **Framework:** Astro 4.x (static output)
- **Styling:** Tailwind CSS 3.x
- **Language:** TypeScript (strict mode)
- **Deployment:** S3 + CloudFront (via GitHub Actions on push to `main`)

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Build static site to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm test` | Run Astro check (type/template validation) |

## Design Tokens

The site uses a custom design token system defined in Tailwind config:

- **Colors:** Ember palette (`ember-50` through `ember-950`) for brand warmth, neutral grays for structure
- **Typography:** Geist font family (Sans + Mono)
- **Spacing/Layout:** Standard Tailwind scale
- **Aesthetic:** "Candlelit gallery" — premium, intimate, restrained. Warm restraint over trading-floor energy.

## Project Structure

```
src/
  components/   — Reusable Astro components
  layouts/      — Page layouts (BaseLayout)
  pages/        — Route pages (index.astro)
  styles/       — Global CSS (fonts, base styles)
public/         — Static assets
```

## Conventions

- Components use PascalCase filenames (e.g., `Hero.astro`)
- All interactive scripts go in `<script>` tags within Astro components
- Accessibility: semantic HTML, ARIA labels, keyboard navigation support
- No client-side JavaScript frameworks — Astro islands only if needed
- Brand voice: warm restraint, no hype, no promises. See mission statement.
