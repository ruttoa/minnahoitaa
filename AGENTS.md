This is an EmDash site — a CMS built on Astro with a full admin UI — for **Minna hoitaa**, a pet care / home cleaning / garden maintenance business. Build plan and content spec: [PLAN.md](PLAN.md). Progress against the plan's phases is tracked in the session's task list, not in this file.

## Commands

```bash
pnpm dev              # Start dev server (runs migrations, seeds, generates types) + EmDash admin
npx emdash types      # Regenerate TypeScript types from schema
pnpm approve-builds --all   # Needed once after install (parcel/watcher build script)
```

The admin UI is at `http://localhost:4321/_emdash/admin`.

**Node caveat:** EmDash's docs state odd-numbered Node majors are unsupported. If the environment's global Node is odd (currently v25 here), use the pinned Node 22 install instead — see [README.md](README.md#prerequisites) for the exact PATH prefix.

## Key files

| File | Purpose |
|---|---|
| `astro.config.mjs` | Astro config: `emdash()` integration, D1/R2, i18n block (`fi` default, `en` under `/en/`), Vite SCSS `additionalData` auto-injecting `@use "abstracts" as *;` into every component style block |
| `src/live.config.ts` | EmDash loader registration (boilerplate — don't modify) |
| `seed/seed.json` | Schema definition + content (collections, fields, taxonomies, menus, widgets) — Finnish entries first, English via `translationOf` (Phase 2, in progress) |
| `emdash-env.d.ts` | Generated types for collections (auto-regenerated on dev server start — don't hand-edit) |
| `src/layouts/BaseLayout.astro` | `<html lang>`, head/meta/hreflang, skip link, `SiteHeader`, `<main id="main">`, `SiteFooter`, EmDash page-contribution slots |
| `src/layouts/PageLayout.astro` | `BaseLayout` + page-header pattern (H1 + optional intro) |
| `src/i18n/ui.ts` + `fi.json`/`en.json` | Typed `t()` helper for every non-CMS user-visible string. **Zero bare Finnish string literals in `.astro` templates** — this is a hard rule, checked in Phase 8 QA. |
| `src/lib/routes.ts` | `CONTACT_PATH` — every CTA on the site resolves through this constant. Never hardcode `/ota-yhteytta/` elsewhere. |
| `src/styles/` | `abstracts/` (tokens/mixins/breakpoints), `base/` (reset/typography/a11y/forms), `layout/` (`.l-container`/`.l-grid`/`.l-section` — section spacing owned only by `_l-section.scss`) |
| `src/pages/` | Astro pages — all server-rendered, fi at root, en under `/en/` |

## Skills

Agent skills are in `.agents/skills/`. Load them when working on specific tasks:

- **building-emdash-site** — Querying content, rendering Portable Text, schema design, seed files, site features (menus, widgets, search, SEO, comments, bylines). Start here.
- **creating-plugins** — Building EmDash plugins with hooks, storage, admin UI, API routes, and Portable Text block types.
- **emdash-cli** — CLI commands for content management, seeding, type generation, and visual editing flow.

## Documentation

The EmDash docs are available as an MCP server at `https://docs.emdashcms.com/mcp`. When you need to verify an API, hook, config option, field type, or pattern, check the live documentation rather than relying on training-data recall (EmDash is beta, launched April 2026, and the API moves). This template ships with `.mcp.json`, `.cursor/mcp.json`, and `.vscode/mcp.json` so Claude Code, Cursor, and VS Code auto-discover the docs server.

## Rules

**EmDash-specific:**
- All content pages must be server-rendered (`output: "server"`). No `getStaticPaths()` for CMS content.
- Image fields are objects (`{ src, alt }`), not strings. Use `<Image image={...} />` from `"emdash/ui"`.
- `entry.id` is the slug (for URLs). `entry.data.id` is the database ULID (for API calls like `getEntryTerms`).
- Always call `Astro.cache.set(cacheHint)` on pages that query content.
- Taxonomy names in queries must match the seed's `"name"` field exactly (e.g., `"category"` not `"categories"`).
- Content is Portable Text (structured JSON) — render with `<PortableText>`, never `set:html`.
- `getSiteSettings()`'s built-in schema is fixed (`title`, `tagline`, `logo`, `favicon`, `url`, `postsPerPage`, `dateFormat`, `timezone`, `social`, `seo`) — it cannot be extended with custom fields. Business data the plan calls "site settings" (phone, email, WhatsApp, Y-tunnus, service area) needs its own singleton collection instead; `social.facebook` does cover the Facebook URL.

**Project-specific (see PLAN.md for full rationale):**
- No inline `style="…"` attributes anywhere. No Tailwind. No `!important`.
- BEM everywhere in component markup and SCSS (`.service-card`, `.service-card__icon`, `.service-card--pets`).
- Every CTA resolves to `CONTACT_PATH` from `src/lib/routes.ts` — never a hardcoded path.
- Progressive enhancement only: the site must be fully readable/navigable with JS disabled.

## This project's content model

Not the generic starter's blog schema — see [PLAN.md §4](PLAN.md) for the target: `services`, `testimonials`, `price_groups`/`price_items`, `pages` (prose), `gallery_items` collections, plus a business-info singleton for contact details. The starter's `posts`/`category`/`tag` routes and schema are scaffold leftovers, not part of this site's IA (see PLAN.md §3) — they get removed once the real content model and pages land (Phase 2/4).

## Visual character

Defined — see [docs/design-tokens.md](docs/design-tokens.md) and `src/styles/abstracts/_tokens.scss`. A Nordic winter-dusk palette (not cream/serif/terracotta), Bricolage Grotesque (display) + Atkinson Hyperlegible Next (body), fluid type scale, one CSS-only "lamp glow" signature element. Don't introduce new colours, type sizes, or spacing values outside the token set — extend the tokens instead.
