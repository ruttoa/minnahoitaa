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
| `seed/seed.json` | Schema definition + content (collections, fields, menus). Finnish entries only so far — English via `translationOf` lands in Phase 6. `gallery_items` collection exists but is deliberately unseeded: needs the client's photo-use permission first (see `docs/media-credits.md`). |
| `emdash-env.d.ts` | Generated types for collections (auto-regenerated on dev server start — don't hand-edit) |
| `src/layouts/BaseLayout.astro` | `<html lang>`, head/meta/hreflang, skip link, `SiteHeader`, `<main id="main">`, `SiteFooter`, EmDash page-contribution slots |
| `src/layouts/PageLayout.astro` | `BaseLayout` + page-header pattern (H1 + optional intro) |
| `src/i18n/ui.ts` + `fi.json`/`en.json` | Typed `t()` helper for every non-CMS user-visible string. **Zero bare Finnish string literals in `.astro` templates** — this is a hard rule, checked in Phase 8 QA. |
| `src/lib/routes.ts` | `CONTACT_PATH` — every CTA on the site resolves through this constant. Never hardcode `/ota-yhteytta/` elsewhere. |
| `src/styles/` | `abstracts/` (tokens/mixins/breakpoints), `base/` (reset/typography/a11y/forms), `layout/` (`.l-container`/`.l-grid`/`.l-section` — section spacing owned only by `_l-section.scss`) |
| `src/pages/` | Astro pages — all server-rendered, fi at root, en under `/en/`. `index.astro` is the real homepage (Hero, ServiceCard grid, About, TestimonialStrip, ContactBand), not a placeholder. |
| `src/components/SiteHeader.astro` | Mobile nav is a real disclosure, not a `<details>` fallback: nav is inline/always-visible in the no-JS baseline (no toggle button, since it starts `hidden`); a tiny inline script in `BaseLayout` adds `html.js`, which is what lets CSS turn the nav into a collapsible panel and reveal the toggle below the `lg` breakpoint. The Escape-closes-and-refocuses listener is bound to `document`, not the `nav` — focus sits on the toggle button (outside `nav`) when the panel is open, so a `nav`-scoped listener never fires. |

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

Not the generic starter's blog schema — built per [PLAN.md §4](PLAN.md): `services`, `testimonials`, `price_groups` + `price_items` (linked by a `reference` field), `pages` (prose fragments — currently `koti-hero`, `minusta`, `hinnasto-ehdot`, embedded into dedicated routes by id, not generically slug-routed), `gallery_items`, and `business_info` (a one-entry collection — EmDash has no dedicated singleton type, "one entry by convention" is the pattern). The starter's `posts`/`category`/`tag` collections and routes, and the generic `[slug].astro` catch-all, have been removed — they weren't part of this site's IA.

All six routes exist and are wired to real content, in both locales (`/en/` mirrors each fi path — see the i18n section below): `/`, `/palvelut/` (each service gets a full `ServiceSection`, anchored by `service.id`/slug for `ServiceCard`'s `#anchor` links), `/hinnasto/` (`PriceTable` + `hinnasto-ehdot` terms), `/galleria/` (empty-state only — no photos seeded yet), `/ota-yhteytta/` (contact details + the real contact form), `/tietosuoja/` (draft privacy statement, needs legal review — flagged on-page in its own content), `/404`. No `/palvelut/[slug]/` detail pages — each service's body is already full-length inline on `/palvelut/`, so a separate page would just duplicate it; revisit only if content grows enough to justify it. 301s for the three changed old-Webador paths live in `astro.config.mjs`'s `redirects` (framework-native, not EmDash's seed-driven `redirects`/`middleware/redirect` — simpler for a fixed, small set). `LocalBusiness` JSON-LD (with `makesOffer` from the `services` collection) renders site-wide from `BaseLayout`.

Seed reference fields use the seed-local `"$ref:id"` syntax (e.g. `"service": "$ref:svc:pets"`) resolved at apply time — confirmed working by inspecting a seeded testimonial in the admin (resolves to the correct service ULID). Note: the admin renders `reference` fields as a raw ID text input by default, not a picker — cosmetic, data is correct; revisit if a nicer editing widget matters to the client.

`repeater` fields (e.g. `services.bullets`) need `validation.subFields` (not `options.fields`) — each sub-field is `{slug, type, label, required?}`, limited to `string | text | url | number | integer | boolean | datetime | select | image` (no nesting, no portableText/reference inside a repeater item).

## i18n / English locale

Fully bilingual now: every collection and menu has `locale: "en"` + `translationOf: "<fi-id>"` entries in `seed/seed.json` (`business_info` too, despite being mostly locale-invariant facts — only `service_area` actually differs per locale, but a full duplicate entry was simpler than splitting one field out). `/en/` routes are real files under `src/pages/en/`, not a rewrite trick — Astro's directory-based i18n routing needs an actual file per locale per route. To avoid duplicating each page's logic, every route is a two-line wrapper (`src/pages/palvelut/index.astro`, `src/pages/en/palvelut/index.astro`, …) importing a shared component from `src/components/pages/*.astro`, which reads `Astro.currentLocale` itself — works from any file since `Astro.currentLocale` reflects the matched route, not which file rendered it.

**A real, non-obvious bug class found here, worth knowing before adding new locale-aware queries**: `getEmDashCollection`/`getEmDashEntry` only apply the locale fallback chain (`en` → `fi`, per `astro.config.mjs`'s `i18n.fallback`) when you explicitly pass `locale`. Omit it, and the query doesn't return "everything" — it filters for entries with **no** locale value, which happens to include untranslated fi-default entries but silently excludes anything with an explicit `locale: "en"`. Two real instances of this shipped and were only caught by testing the `/en/` pages against real seeded content, not by typecheck or build:
- `PriceTable.astro`'s **inner** `price_items` sub-query (filtered by `where: { group: ... }`) needed its own `locale` — passing it on the outer `price_groups` query wasn't enough, and without it the English pricing page silently rendered two price groups with zero items each.
- `BaseLayout`'s `servicesForLd` (for `LocalBusiness` JSON-LD `makesOffer`) and `GalleryGrid`'s `gallery_items` query both had the same gap, fixed pre-emptively even though the visible symptom (duplicate/missing entries) wasn't yet showing for gallery (still empty) — check any *new* `getEmDashCollection`/`getEmDashEntry` call added later for a missing `locale` the same way.

The contact form needed a second, separately-admin-created form (`scripts/contact-form-en.json`, slug `contact`) rather than one translated form — see the "Contact form" section below; `ContactForm.astro` picks the form id from `locale`.

## Contact form (`@emdash-cms/plugin-forms`)

The contact form uses EmDash's official first-party forms plugin (registered in `astro.config.mjs`'s `emdash({ plugins: [...] })`, pinned to `0.2.4`), not a bespoke form + API route. This was a deliberate trade-off the client chose knowingly: submissions land in the admin and email automatically with no external provider/API key, at the cost of the form no longer being reproducible from `seed/seed.json` (the plugin has no seed-file integration — forms live in its own plugin storage, configured only through its admin API) and needing extra work to close accessibility gaps it doesn't cover out of the box.

- **Reproducing the form(s)**: after any fresh reseed (e.g. wiping `.wrangler/state`), run `./scripts/setup-contact-form.sh` against the running dev server — it now creates **two** forms, `scripts/contact-form.json` (fi, slug `yhteydenotto`) and `scripts/contact-form-en.json` (en, slug `contact`). Idempotent-safe to re-run (fails harmlessly on a slug conflict if a form already exists). Edit the JSON files to change fields/settings, then re-run — don't hand-edit either form in the admin UI, or the seed script and the live forms will drift. Two separate forms exist because the plugin has no per-form translation mechanism (a single form's field labels aren't locale-aware); `ContactForm.astro` picks `yhteydenotto` vs `contact` from the `locale` prop.
- **How it's rendered**: `src/components/ContactForm.astro` embeds it via a Portable Text `emdash-form` block (`{ _type: "emdash-form", formId: "yhteydenotto" }`), not a `<Form>` tag — despite one of the plugin's own docblocks suggesting `@emdash-cms/plugin-forms/ui`, that export path doesn't exist in `package.json#exports`; the Portable Text block is the only supported integration point for a plugin at this version. `PortableText` auto-resolves it via the `virtual:emdash/block-components` virtual module — no manual component import needed.
- **Styling**: the plugin's own CSS (`@emdash-cms/plugin-forms/styles`) is never imported. `ContactForm.astro` themes it via a **whole-block `is:global` `<style>`**, not a `:global()`-wrapped selector nested under a scoped one — that nearly shipped broken. Astro's scoping only exempts the exact selector text inside `:global(...)`; every *other* compound selector in the same rule (e.g. a plain `.ec-form-submit` nested under `:global(.contact-form) { }`) still gets Astro's scope attribute appended, which then never matches the plugin's actually-unscoped DOM. Caught this because the submit button rendered with no lamp-accent background at all — verify any future style tweak here the same way (`getComputedStyle` in the browser, not just reading the SCSS).
- **Accessibility gap closed on top of the plugin**: the plugin gives inline per-field errors but not PLAN.md §7's exact spec (error summary at top + focus moved to it, `aria-invalid`). `ContactForm.astro`'s `<script>` adds this independently, reacting only to the native Constraint Validation API (`checkValidity()`) rather than the plugin's internals, so it keeps working across plugin updates. It also sets `form.noValidate = true` once JS runs — the no-JS baseline relies on native browser validation (still reasonably accessible on its own); JS takes over so the `submit` event actually fires and custom UI can render instead of the browser's native popup.
- **Two real bugs found and worked around** (both in the plugin's own template/client script, not ours — safe to remove the workarounds on a version bump if fixed upstream):
  1. `FormEmbed.astro`'s `<textarea>` renders `{field.defaultValue || ""}` as JSX-like children, which leaves stray whitespace (the template's own indentation) as the textarea's initial value. That whitespace satisfies the native `required` constraint even when the visitor typed nothing — `checkValidity()` alone says valid. Server-side `validateSubmission` correctly `.trim()`s and would reject it, so a blank message was never going to actually reach Minna, but the client silently let a broken-feeling submit through. Worked around in `ContactForm.astro`'s script with an explicit `value.trim() === ""` check layered on top of `checkValidity()`.
  2. The plugin's client script restores the submit button's label from `form.dataset.submitLabel` after a submission, but its own server template never sets that dataset attribute — so the button silently reverted to the hardcoded English "Submit" after every submit, regardless of locale. Worked around by populating `form.dataset.submitLabel` ourselves from the button's actual server-rendered (localized) text, in the same `<script>`.
- **Not yet verified**: whether `ctx.email` (the capability the plugin uses to actually send the notification email) is configured/working in this environment beyond landing in local dev's admin — confirmed submissions land in the admin (`/_emdash/admin/plugins/emdash-forms/submissions`, "2 total" after two test submits), but real email delivery to `minna.petsitter@gmail.com` hasn't been confirmed. Check this before launch.
- **Retention**: `retentionDays: 0` in `scripts/contact-form.json` means submissions are kept indefinitely (not auto-deleted) — worth revisiting for a tighter GDPR posture (e.g. 365 days), adjustable via the admin's form settings or by editing the script and recreating the form.

## Visual character

Defined — see [docs/design-tokens.md](docs/design-tokens.md) and `src/styles/abstracts/_tokens.scss`. A Nordic winter-dusk palette (not cream/serif/terracotta), Bricolage Grotesque (display) + Atkinson Hyperlegible Next (body), fluid type scale, one CSS-only "lamp glow" signature element. Don't introduce new colours, type sizes, or spacing values outside the token set — extend the tokens instead.

The lamp glow appears in exactly two places per the design brief (hero portrait, service-card icon on hover) plus one functional exception: `ServiceSection`'s glyph fallback (used when a service has no photo yet — currently all three) carries an ambient version of it, because that glow is standing in for a missing photo ("use a CSS/SVG visual rather than a grey box"), not decoration for its own sake. A third occurrence on `ContactBand` was added during Phase 3 and removed during Phase 7's self-critique pass — it wasn't in the brief and diluted "the one bold move." If you're tempted to add the glow somewhere else, ask whether it's replacing an actual missing image first.

## Motion

Three sanctioned moments (PLAN.md §2), all wrapped in `@media (prefers-reduced-motion: no-preference)`: the hero's staggered load reveal (`Hero.astro`), the hover lamp glow, and a scroll-triggered fade-up on the homepage's service triptych (`ScrollReveal.astro`, included once from `BaseLayout`). The reveal follows the same no-JS-safe pattern as the mobile nav: elements marked `[data-reveal]` are visible by default, and only get the hide-then-reveal treatment under `html.js` (set by the same bootstrap script the mobile nav uses) — so a visitor without JS, or with reduced motion, always just sees the content. Mark a group's children with `[data-reveal-group] > *` for the staggered `:nth-child` delays.

Print stylesheet lives in `src/styles/base/_print.scss` (hides header/footer/CTAs/decorative glows, forces black-on-white, keeps price rows from breaking across a page) — the price list (`/hinnasto/`) is the primary target per PLAN.md §7, but the rules apply site-wide.

**Tooling note for future screenshot-based review**: the Browser pane's screenshot tool has a rendering quirk in this environment — at some explicit `width`/`height` combinations (observed at 768×900) it captures a devicePixelRatio-scaled but uncropped-to-fit image, making a fully-correct layout look cut off at roughly half width. Verified this is a capture artifact, not a real bug, via `getComputedStyle`/`getBoundingClientRect` (grid columns summed to the full requested width) — the `tablet`/`mobile` presets and explicit widths like 320 or 1280 rendered correctly. If a screenshot at some other specific width looks implausibly broken (content cut off mid-container with a large flat blank area, not a wrapping/overflow issue), cross-check computed styles before concluding it's a real layout bug.
