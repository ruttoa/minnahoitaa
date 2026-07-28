# Design tokens — "Minna hoitaa"

Ground truth: `src/styles/abstracts/_tokens.scss`. This doc explains the *why*; the SCSS file is the source of truth for values.

## Colour — Nordic winter-dusk

| Token | Hex | Role |
|---|---|---|
| `--c-spruce-900` | `#12241F` | Ink, footer, dark sections |
| `--c-spruce-600` | `#2E5348` | Headings, primary button |
| `--c-sage-300` | `#A8BCAE` | Borders, muted UI, icon strokes |
| `--c-frost-050` | `#EDF0EA` | Page surface (cool, not cream) |
| `--c-lamp-500` | `#E8A33D` | Signature accent — warm window light. CTAs, focus rings, hover glow |
| `--c-rowan-600` | `#B0392A` | Sparingly: errors, one emphasis moment |

`spruce-600` on `frost-050` and white on `spruce-900` both clear 4.5:1. `lamp-500` is a background/graphic colour only — body text never sits directly on it; `spruce-900` text sits on lamp-coloured buttons.

Rationale: the brief explicitly ruled out the cream/serif/terracotta "small business" look. Minna's actual job is letting herself into someone's home while they're away — a dusk-lit window, someone still up, still watching the place. The palette is built around that image rather than around "pets" (no illustrated paw-print orange) or "cleaning" (no clinical blue-white).

## Type

- Display: **Bricolage Grotesque** (variable, `@fontsource-variable/bricolage-grotesque`) — width + optical-size axes used, not just weight.
- Body/UI: **Atkinson Hyperlegible Next** (`@fontsource-variable/atkinson-hyperlegible-next`) — designed for legibility research, not decoration. For a service that means "person with your house key," legibility of the pricing table and the contact form is part of the trust signal, not a neutral choice.
- Self-hosted, `font-display: swap`, `latin` + `latin-ext` subsets (required for ä/ö/Ä/Ö), display face preloaded only.

Fluid scale (`clamp()`), 9 steps `--fs-900` → `--fs-100`, each with its own `line-height` — the hero does not inherit a global `1.5`.

## Layout

One 12-column grid, `--container-max: 76rem`. Spacing scale `--s-1`…`--s-12` on a 4px base, non-linear past `--s-6` (steps get further apart at larger sizes, matching how section-level spacing actually varies more than component-level spacing).

## Signature element — lamp glow

CSS-only `radial-gradient` + `filter: blur()` warmth behind the hero portrait and (at low opacity) behind service-card icons on hover. No images. Disabled under `prefers-reduced-motion`.

## Self-check

Re-read after writing: does any of this read as generic "small business site" output? The cream/terracotta/serif combination was the default to avoid, and this table doesn't contain it. The one thing to watch during build: the lamp glow is the *only* bold move — if additional decorative elements creep in during component work, cut them, not this one.
