# gazeprotocol.com — Landing Page Design Direction

> Issue #426 — P0 Design Direction
> Designer: Gaze Designer Agent
> Stitch Project: `4781636945829518132` (Gaze Landing Page — Issue #426)
> Design System: **Obsidian Amber**
> Status: COMPLETE — Ready for Builder implementation

---

## Design System: Obsidian Amber

### Creative North Star: "The Observational Monolith"

The landing page is a high-end editorial experience. It feels like an immovable, sophisticated anchor in the volatile Web3 space. We move away from neon-on-black crypto clichés toward **Intentional Asymmetry** and **Tonal Depth**.

---

## Color Tokens

```css
:root {
  /* Surfaces */
  --surface:                  #131318;  /* Base background */
  --surface-dim:              #131318;
  --surface-container-lowest: #0e0e13;  /* Footer, darkest sections */
  --surface-container-low:    #1b1b20;  /* Secondary sections */
  --surface-container:        #1f1f24;  /* Cards */
  --surface-container-high:   #2a292f;  /* Hover states */
  --surface-container-highest:#35343a;  /* Modals, dropdowns */
  --surface-variant:          #35343a;

  /* Primary — Amber */
  --primary:                  #ffe4c9;  /* Light amber, highlights */
  --primary-container:        #ffc174;  /* Main amber accent */
  --primary-fixed:            #ffddb7;
  --primary-fixed-dim:        #f8bb6f;  /* Tertiary links */
  --on-primary:               #472a00;  /* Text on amber buttons */
  --on-primary-fixed:         #2a1700;  /* Dark text on primary CTA */

  /* Secondary — Warm Brown */
  --secondary:                #e2c19c;
  --secondary-container:      #5c4529;
  --on-secondary:             #412c12;

  /* Tertiary — Teal (data viz) */
  --tertiary:                 #c6f0ff;
  --tertiary-container:       #8ad8f1;

  /* Text */
  --on-surface:               #e4e1e8;  /* Primary text — NEVER use #fff */
  --on-surface-variant:       #d5c4b3;  /* Secondary text */
  --on-background:            #e4e1e8;

  /* Borders */
  --outline:                  #9d8e7f;  /* Muted borders */
  --outline-variant:          #504538;  /* Ghost borders (use at 20% opacity) */

  /* Error */
  --error:                    #ffb4ab;
  --error-container:          #93000a;
}
```

### The "No-Line" Rule
**Prohibit 1px solid borders for sectioning.** Separation is achieved through:
- **Tonal shifts** — adjacent surface tiers create natural boundaries
- **Radial glows** — amber/purple gradients draw the eye without structural lines
- **Ghost border fallback** — `outline-variant` at 20% opacity only when accessibility requires it

### Grain Texture
Every primary surface must include a `0.05` opacity grain overlay. Use CSS `background-image` with an SVG noise filter or a subtle PNG grain at 5% opacity. This prevents the "perfect digital black" and creates a tactile, cinematic feel.

---

## Typography Scale

```css
/* Fonts */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
/* JetBrains Mono for all numeric/data display */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&display=swap');

:root {
  /* Display — Hero headlines */
  --text-display-lg-size:     3.5rem;
  --text-display-lg-weight:   600;
  --text-display-lg-tracking: -0.04em;
  --text-display-lg-font:     'Space Grotesk', sans-serif;

  /* Headline — Section titles */
  --text-headline-lg-size:    2rem;
  --text-headline-md-size:    1.75rem;
  --text-headline-font:       'Space Grotesk', sans-serif;
  --text-headline-weight:     500;

  /* Body */
  --text-body-lg-size:        1rem;
  --text-body-lg-line-height: 1.6;
  --text-body-font:           'Inter', sans-serif;
  --text-body-weight:         300;

  /* Label — Eyebrows, metadata */
  --text-label-md-size:       0.75rem;
  --text-label-font:          'Inter', sans-serif;
  --text-label-tracking:      0.1em;

  /* Mono — All numbers and data */
  --text-mono-font:           'JetBrains Mono', monospace;
}
```

---

## Spacing System (8px grid)

```css
:root {
  --space-1:  0.25rem;  /*  4px */
  --space-2:  0.5rem;   /*  8px */
  --space-3:  0.75rem;  /* 12px */
  --space-4:  1rem;     /* 16px */
  --space-6:  1.5rem;   /* 24px */
  --space-8:  2rem;     /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
  --space-30: 7.5rem;   /* 120px — section vertical padding */
}
```

---

## Border Radius

```css
:root {
  --radius-sm:  0.125rem;  /*  2px */
  --radius-md:  0.375rem;  /*  6px — buttons, inputs */
  --radius-lg:  0.5rem;    /*  8px — cards */
  --radius-xl:  0.75rem;   /* 12px — modals */
  --radius-2xl: 1rem;      /* 16px */
}
```

---

## Shadows & Glows

```css
:root {
  /* Amber glow — primary CTA, key elements */
  --shadow-amber-glow:   0 0 15px rgba(245, 158, 11, 0.27);
  --shadow-amber-glow-lg: 0 0 40px rgba(245, 158, 11, 0.15);

  /* Ambient float shadow */
  --shadow-float: 0 24px 48px rgba(0, 0, 0, 0.5);

  /* Card hover glow */
  --shadow-card-hover: 0 0 20px rgba(255, 193, 116, 0.08);
}
```

---

## Animation

```css
:root {
  /* Easing */
  --ease-default:  cubic-bezier(0.23, 1, 0.32, 1);  /* Heavy, smooth */
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);    /* Material standard */

  /* Durations */
  --duration-fast:   200ms;
  --duration-normal: 400ms;
  --duration-slow:   600ms;

  /* Page transitions: fade only, never slide */
  /* Hover transitions: 400ms, ease-standard */
  /* Skeleton pulse: 2s infinite */
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

---

## Component Specifications

### Primary Button ("Amber Pulse")
```css
.btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  color: var(--on-primary-fixed);  /* #2a1700 — dark brown, high contrast */
  border-radius: var(--radius-md);
  padding: 14px 28px;
  font-family: var(--text-body-font);
  font-weight: 500;
  font-size: 0.9375rem;
  box-shadow: var(--shadow-amber-glow);
  transition: box-shadow var(--duration-normal) var(--ease-standard),
              transform var(--duration-fast) var(--ease-standard);
}
.btn-primary:hover {
  box-shadow: var(--shadow-amber-glow-lg);
  transform: translateY(-1px);
}
```

### Ghost Button
```css
.btn-ghost {
  background: transparent;
  color: var(--on-surface);
  border: 1px solid rgba(80, 69, 56, 0.4);  /* outline-variant at 40% */
  border-radius: var(--radius-md);
  padding: 14px 28px;
  transition: background var(--duration-normal) var(--ease-standard),
              border-color var(--duration-normal) var(--ease-standard);
}
.btn-ghost:hover {
  background: var(--surface-container-high);
  border-color: rgba(255, 193, 116, 0.3);  /* amber tint on hover */
}
```

### Navigation Bar
```
[Eye Icon 20px] [GAZE wordmark — Space Grotesk thin, letter-spacing 8px, gradient fill]
                                    [Protocol] [Creators] [Leaderboard] [Docs]    [Connect Wallet]
```
- Fixed to top, `backdrop-filter: blur(20px)`, `background: rgba(19, 19, 24, 0.8)`
- Height: 64px, horizontal padding: 48px
- Links: Inter 300, 12px, `var(--on-surface-variant)`, hover → `var(--primary-container)`
- Connect Wallet: Ghost button style, smaller (12px, 36px height)

### Cards
```css
.card {
  background: var(--surface-container);  /* #1f1f24 */
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  /* Subtle amber radial gradient bottom-right */
  background-image: radial-gradient(
    circle at 100% 100%,
    rgba(255, 193, 116, 0.04) 0%,
    transparent 60%
  );
  transition: background var(--duration-normal) var(--ease-standard),
              box-shadow var(--duration-normal) var(--ease-standard);
}
.card:hover {
  background: var(--surface-container-high);
  box-shadow: var(--shadow-card-hover);
}
```

### Stats Bar
```css
.stat-value {
  font-family: var(--text-mono-font);
  font-size: 2.5rem;
  font-weight: 600;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.stat-label {
  font-family: var(--text-label-font);
  font-size: var(--text-label-md-size);
  text-transform: uppercase;
  letter-spacing: var(--text-label-tracking);
  color: var(--on-surface-variant);
}
```

---

## Page Sections

### 1. Hero (Screen ID: `bf11ca9703214bc392f1e7aa1c2c093e`)

**Layout:** Full viewport height, asymmetric split
- Left 55%: Text content, left-aligned
- Right 45%: Burning Eye motif, bleeds off right edge

**Content:**
```
[NAV BAR]

Your attention is
already valuable.

Now you get to keep it.          ← amber color

Gaze is an attention rewards protocol on Solana.
Watch creators you love. Earn from the attention
you already give.

[Install Extension]  [Explore Creators →]
```

**Background:** Obsidian `#131318` + radial purple gradient behind eye (`rgba(113, 5, 194, 0.08)`) + grain overlay

**Burning Eye:** Concentric amber rings, 280px, partially off-screen right. Iris pulse animation (scale 1→1.06, 6s ease-in-out infinite).

**Scroll indicator:** Centered bottom, thin amber line + "scroll" label in label-md style

---

### 2. How It Works (Screen ID: `abe97407268f4201b043b0d1a0369cf4`)

**Layout:** Full-width, 120px vertical padding, section bg `#1b1b20`

**Content:**
```
HOW IT WORKS                     ← eyebrow, amber, uppercase

Three ways to participate.       ← headline

[Watch Card]    [Create Card]    [Stake Card]
```

**Cards (equal width, 3-column grid, 32px gap):**

| | Watch | Create | Stake |
|---|---|---|---|
| Icon | Eye (48px, amber) | Token/coin (48px, amber) | Lock (48px, amber) |
| Title | Watch | Create | Stake |
| Body | Install the Chrome extension. Watch creators on YouTube, Twitch, Kick, and 6 more platforms. Your verified watch time earns you a place on the leaderboard. | Launch your personal token with bonding curve pricing. Your audience stakes your token and watches your content. Their attention determines your monthly rewards. | Buy a creator token and stake it. Options accrue every second. Watch the creator while staked and contribute 9x to their leaderboard score. |
| Detail | 9 platforms supported | Permissionless launch | 9x leaderboard multiplier |

---

### 3. Protocol Stats (Screen ID: `2512ac585e2d42e385768f7d9f309776`)

**Layout:** Full-width, bg `#0e0e13` (darkest), creates contrast

**Content:**
```
PROTOCOL                         ← eyebrow

On-chain. Auditable. Transparent.  ← headline

[$4.2M] | [12,847] | [347] | [9]
Total Value  Active    Creator   Platforms
Staked       Watchers  Tokens

Updated in real time from Solana.

[YouTube] [Twitch] [Kick] [Rumble] [X] [Parti] [Arena] [Abstract] [Pump.fun]
```

**Stats:** JetBrains Mono, 2.5rem, amber gradient fill. Vertical dividers at `outline-variant` 20% opacity.

**Platform badges:** `surface-container` background, `outline-variant` border at 20%, 0.75rem Inter, `on-surface-variant` text.

**Note:** Stats values are placeholders. Implementation must wire to live API: `GET /tokens/platform`

---

### 4. Call to Action + Footer (Screen ID: `475789c7935b4ab3a24448ff323cb856`)

**CTA Layout:** Centered (exception to left-align rule — closing moment)

**Content:**
```
        [Burning Eye — 80px, amber glow]

    Your attention is already valuable.

  Gaze makes that visible. Install the extension,
       watch what you watch, earn every second.

[Install Chrome Extension]  [Launch a Token]  Explore Creators →

    Free to install. No tokens required to start watching.
```

**Footer:**
```
[Eye] GAZE          Protocol  Creators  Leaderboard  Docs  GitHub          [X] [Telegram]

─────────────────────────────────────────────────────────────────────────────────────────
© 2025 Graviton Inc. Built on Solana.
```
Footer bg: `#0e0e13`

---

## Responsive Breakpoints

```css
/* Mobile-first */
--breakpoint-sm:  640px;   /* Small mobile */
--breakpoint-md:  768px;   /* Tablet */
--breakpoint-lg:  1024px;  /* Desktop */
--breakpoint-xl:  1280px;  /* Wide desktop */
--breakpoint-2xl: 1536px;  /* Ultra-wide */
```

### Mobile Adaptations
- **Hero:** Stack vertically. Eye motif moves above text, scales to 180px, centered.
- **How It Works:** Cards stack to single column.
- **Stats:** 2x2 grid on mobile, 4-column on desktop.
- **Nav:** Hamburger menu, full-screen overlay.
- **Touch targets:** Minimum 44px height on all interactive elements.

---

## Accessibility Requirements (WCAG 2.1 AA)

| Element | Requirement | Token |
|---|---|---|
| Body text on surface | ≥ 4.5:1 contrast | `on-surface` (#e4e1e8) on `surface` (#131318) ✓ |
| Secondary text | ≥ 4.5:1 contrast | `on-surface-variant` (#d5c4b3) on `surface` (#131318) ✓ |
| Primary button text | ≥ 4.5:1 contrast | `on-primary-fixed` (#2a1700) on `primary-container` (#ffc174) ✓ |
| Focus indicators | Visible, 3px minimum | Amber outline, `var(--primary-container)` |
| Touch targets | ≥ 44px | All buttons, nav links |
| Motion | Respect `prefers-reduced-motion` | All animations |
| Semantic HTML | Heading hierarchy, landmarks | `<main>`, `<nav>`, `<section>`, `<h1>`→`<h3>` |
| Images | Alt text | Eye motif: `alt="Gaze Protocol — attention rewards"` |

---

## Performance Targets

- **LCP:** < 3s on mobile (3G)
- **CLS:** < 0.1
- **FID/INP:** < 100ms
- **Bundle:** Lazy-load sections below the fold
- **Images:** WebP format, `loading="lazy"` on non-hero images
- **Fonts:** `font-display: swap`, preload Space Grotesk and Inter subsets
- **Eye motif:** SVG inline (not PNG), no external requests

---

## Asset Requirements

### Required Assets
1. **Burning Eye SVG** — Concentric amber rings, iris/pupil structure. Sizes: 16px, 24px, 48px, 80px, 180px (mobile hero), 280px (desktop hero). Variants: full (with glow), simple (no glow), mono (single color).
2. **GAZE Wordmark SVG** — Space Grotesk thin, gradient fill (amber). Horizontal layout.
3. **Platform Icons** — SVG icons for: YouTube, Twitch, Kick, Rumble, X, Parti, Arena, Abstract, Pump.fun. 16px and 24px sizes.
4. **Grain Texture** — SVG noise filter or PNG (tileable, 200x200px, 5% opacity).
5. **Social Icons** — X (Twitter), Telegram. 20px SVG.

### Icon Style
- Stroke-based, 1.5px weight
- Rounded line caps
- Amber color (`var(--primary-container)`) for feature icons
- `var(--on-surface-variant)` for nav and footer icons

---

## Tech Stack Notes (Next.js + Tailwind)

### Tailwind Config Extensions
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'gaze-surface':     '#131318',
        'gaze-surface-low': '#1b1b20',
        'gaze-card':        '#1f1f24',
        'gaze-amber':       '#ffc174',
        'gaze-amber-light': '#ffe4c9',
        'gaze-text':        '#e4e1e8',
        'gaze-text-muted':  '#d5c4b3',
        'gaze-ghost':       '#9d8e7f',
      },
      fontFamily: {
        'display': ['Space Grotesk', 'sans-serif'],
        'body':    ['Inter', 'sans-serif'],
        'mono':    ['JetBrains Mono', 'monospace'],
      },
    },
  },
}
```

### File Structure
```
src/
  app/
    page.tsx              ← Landing page
    layout.tsx            ← Root layout with fonts
  components/
    landing/
      Hero.tsx
      HowItWorks.tsx
      ProtocolStats.tsx
      CallToAction.tsx
      Footer.tsx
    ui/
      BurningEye.tsx      ← Reusable SVG component
      Button.tsx
      Card.tsx
      StatCell.tsx
      NavBar.tsx
```

---

## Stitch Screens Reference

| Section | Screen ID | Screenshot |
|---|---|---|
| Hero | `bf11ca9703214bc392f1e7aa1c2c093e` | [View](https://lh3.googleusercontent.com/aida/ADBb0ugssJfmFtm3VdpB5ZQRDcZuDIlue898WV4t5QiuXsJuxhXVSf7BgU_PciPkBUOfceSsbftSrtbO4JuT-xXsYnt_19Ub8n6gZaPNj_iBrjgapd8IbM_oeik2B2K98GSnLvDpg6h9K-mZ0tVbSGT7nNP-Op2lz1LgNG2tcQ7gOZxkigEDHDEsV6nzDcf3RSJXm_XF-Stmn--re6iwbfAc8M3Dlpjs-kVPxPfFIRhf6jUKdNab8MQUqJxugYQ) |
| How It Works | `abe97407268f4201b043b0d1a0369cf4` | [View](https://lh3.googleusercontent.com/aida/ADBb0ui-jCybb8mIisLFQgavAx9U2yy-wiheXlverMOz9P5g5eCRYSXVAaP30uodpae2Mmwb5he6suATrC7SUu3EuQO6KnRJ1jB1JvGv4f665jOXhPcNXGfdoF-yQ6F2iu_fUBMJr0GuKz_pKCQWz1Msk4lkztH8dFdrna6WcLc-8RGtkT9dXdkmi3DzE-XSEk76CZuzaLWxcsqWShnFTE4I329_UmubMvUWiq2wGaXjE5FJTHLUdQWAFArMakQ) |
| Protocol Stats | `2512ac585e2d42e385768f7d9f309776` | [View](https://lh3.googleusercontent.com/aida/ADBb0ujjhvDlgHVdwL0ADgcuAFkbVjmSjtsL_sHTXesmB6VbBQp270w2H1wYtYYN0594PGYQK1RFAPlp2ErGZ3lRCs-T5E_byQHfP2hGB__qfwyywojy0_PmeSHGL-kgLvDUdHvtnQ3eThZUdc-eWr4sW7SFTbmlD8A4lwqLLqxRTSRx4qM75gBnAiWJ-KjqefjbLyc7ZwojOm8sUSMhQLsL7l88plIrJKfCHwdfKUCFRJjU5P9vVOCGF_ucUQ) |
| CTA + Footer | `475789c7935b4ab3a24448ff323cb856` | [View](https://lh3.googleusercontent.com/aida/ADBb0ujhAYHW7ZX40DdeTxuMaOxhhyzJ1rmjYzFF6lurrWxL20kiaMk1DlC1H86qS1MOLepiHiUfQ_44zmFNEu-o8QV87Iv-FW6t0UW9XtKppTS5vMJKqOCg5BC1F7ooRzYkF6gNNKul-XvlrKc7OpKnjYdbTLaj-CEIfylEfxqs4LO4mj5DPKQMA_443SdctBQwGa09okRTiat_DtQgyJVkvNOXGGYF55o-vNE60POwYnZJoBb5mNogXGgRAPY) |

HTML source for each screen is available via the Stitch API at project `4781636945829518132`.

---

## Handoff

```
STATUS: COMPLETE
NEXT_AGENT: Builder
HUMAN_REVIEW_REQUIRED: NO
BLOCKERS: NONE
NOTES:
  - Stats values are placeholder — wire to GET /tokens/platform API
  - Burning Eye SVG needs to be created by a designer or sourced
  - Platform icons (Parti, Arena, Abstract, Pump.fun) may need custom SVGs
  - Stitch HTML screens are reference implementations, not production code
```
