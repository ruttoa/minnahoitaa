# Minna hoitaa

Marketing site for Minna Rättyä's pet care / home cleaning / garden maintenance business (Länsi-Vantaa, Helsinki capital region). Built with [Astro](https://astro.build) 7 and [EmDash](https://github.com/emdash-cms/emdash) (an Astro-native CMS, currently in beta), deployed to Cloudflare Workers (D1 + R2).

Build plan and content spec: [PLAN.md](PLAN.md). Design token rationale: [docs/design-tokens.md](docs/design-tokens.md). Image sourcing/licensing: [docs/media-credits.md](docs/media-credits.md).

## Prerequisites

- **Node 22.12.0+ (even-numbered major only)** — EmDash's docs state odd-numbered Node majors (e.g. 23, 25) are unsupported. If your global Node is odd-numbered, install 22 LTS alongside it rather than replacing your global version:

  ```bash
  brew install node@22
  ```

  It's keg-only (won't touch your global `node`), so prefix commands in this repo with:

  ```bash
  export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
  ```

  (or use a version manager like `nvm`/`fnm`/`volta` if you have one — just make sure it resolves to 22.x or another even major in this directory).

- **pnpm**, via Corepack: `corepack enable` (this repo pins the exact pnpm version in `package.json#packageManager`).

## Setup

```bash
pnpm install
pnpm dev
```

First `pnpm install` will prompt to approve a build script for `@parcel/watcher` (a `sass` dependency, used for filesystem watching) — approve it:

```bash
pnpm approve-builds --all
```

`pnpm dev` starts Astro + the EmDash admin on `http://localhost:4321`. On first run it writes `EMDASH_ENCRYPTION_KEY` to `.env` (gitignored — don't commit it, don't share it, each environment gets its own).

## Content editing (EmDash admin)

Visit `http://localhost:4321/_emdash/admin`. First visit walks through a setup wizard: site title/tagline, an admin account (email), then a **passkey** (Touch ID / security key / PIN) — this step needs a real device present, it can't be scripted.

Once set up, the client (or any editor) manages all copy, pricing, testimonials, gallery images, and site settings from there — see [PLAN.md §4](PLAN.md) for the content model. Nothing editorial should be hardcoded in `.astro` templates; if you find yourself typing Finnish prose into a component, it belongs in EmDash instead (or in `src/i18n/*.json` if it's a UI string like a button label, not editorial content).

### Reseeding from scratch

The full content set (Finnish + English) lives in `seed/seed.json` so the site is reproducible on a fresh database:

```bash
npx emdash types   # regenerate emdash-env.d.ts after a schema change
```

(Seeding workflow will be documented here once the Phase 2 content model — collections, seed data — lands; see PLAN.md's build-phase checklist.)

## Project structure

```
src/
  components/     One .astro file per UI block, PascalCase, BEM class names
  layouts/        BaseLayout (html/head/skip-link/header/main/footer), PageLayout (+ H1 pattern)
  pages/          Astro routes — fi at root, en under /en/
  styles/
    abstracts/    Tokens, mixins, breakpoints — auto-injected into every component's
                   <style lang="scss"> via vite's additionalData (astro.config.mjs)
    base/         Reset, typography, accessibility helpers, form styles
    layout/       .l-container / .l-grid / .l-section primitives — section spacing
                   lives ONLY in _l-section.scss, never duplicated at component level
    main.scss     Global stylesheet: abstracts + base + layout only, no component CSS
  i18n/           fi.json / en.json + typed t() helper (ui.ts) — every non-CMS
                   user-visible string goes through this, zero bare Finnish literals
                   in templates
  lib/            routes.ts (CONTACT_PATH — every CTA resolves through this),
                   format.ts (price/phone formatting)
content-source/    Archived old-site text + images for reference (gitignored, not
                   part of the build — see docs/media-credits.md for licensing)
```

## Styling rules

No inline `style="…"` attributes, no Tailwind, no `!important`. Component styles are scoped Astro `<style lang="scss">` blocks using BEM (`.service-card`, `.service-card__icon`, `.service-card--pets`). Global tokens/reset/layout live in `src/styles/`, nowhere else, as literals. Full rationale in [PLAN.md §5](PLAN.md).

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Astro dev server + EmDash admin, both on :4321 |
| `pnpm build` | Production build (`astro build`) |
| `pnpm preview` | Preview the production build locally |
| `pnpm typecheck` | `astro check` |
| `pnpm deploy` | Build + `wrangler deploy` to Cloudflare Workers |

## Dependency pinning

`emdash`, `@emdash-cms/cloudflare`, and `astro` are pinned to **exact** versions (no `^`) in `package.json` — EmDash is beta and its API is still moving. Bump deliberately, re-test the admin and a full build after bumping, and update the pin in the same commit.
