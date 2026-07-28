# Build plan — "Minna hoitaa" website (Astro 6 + EmDash CMS)

> **How to use this document:** paste it into the repo as `PLAN.md` and work through it phase by phase. Stop at each checkpoint and verify before moving on. Do not start Phase 2 until Phase 1's acceptance criteria pass.

---

## 0. Context you need before writing any code

**The client.** Minna Rättyä, sole trader (toiminimi, Y-tunnus 3481889-8) based in West Vantaa, Finland, operating across the Helsinki capital region. Three services: **pet care** (the core business — day care, 24h care, walks, home visits, medication), **home cleaning**, and **garden/yard maintenance** (including snow clearing). Qualifications: animal caretaker (Eläintenhoitajan AT), horticultural production PT, landscaping & design artisan PT.

**The current site** (`https://www.minnahoitaa.fi/`) is a Webador template. Pages: Aloitus (home), Palvelut (services), Hinnasto (pricing), Kuvagalleria (gallery), Ota yhteyttä (contact). We are keeping the substance and replacing the execution.

**Primary language is Finnish.** Every string in the UI must be translatable, and the type stack must render `ä`, `ö`, `Ä`, `Ö` correctly — check that any webfont subset includes `latin-ext`.

**⚠️ EmDash is new (Cloudflare/Astro, beta since April 2026).** Your training data on it is probably thin or wrong. Before writing any EmDash code:

1. Fetch `https://docs.emdashcms.com/llms.txt` for the full docs index.
2. If an MCP-aware setup is available, connect the EmDash docs MCP (see `https://docs.emdashcms.com/docs-mcp/`).
3. Scaffold with `npm create emdash@latest` and read what it generates rather than recalling APIs from memory.
4. Pin the EmDash version exactly in `package.json` — it's beta and the API is moving.

Known-good API surface (verify against docs before relying on it):

```ts
import { getEmDashCollection, getEmDashEntry, getMenu, getSiteSettings, getTranslations } from "emdash";
import { PortableText } from "emdash/ui";
```

Content is stored as Portable Text (structured JSON), not HTML — render it with `<PortableText>`, never `set:html`.

---

## 1. Content inventory (source material)

**Do not paste the old site's prose verbatim into the repo.** Fetch each page yourself with a browser/curl, then rewrite the marketing copy in the same voice — warm, plain, first person, no exclamation-mark salesmanship. The old copy is Webador-shaped (stray "Lisää tekstiä napsauttamalla tästä" placeholder, inconsistent bullet punctuation, an em-dash-free wall of text). It needs an editor, not a copy-paste.

The **factual** content below is what must survive the rebuild. Treat it as a data spec.

### Services

| Key | Finnish name | What it covers |
|---|---|---|
| `pets` | Lemmikkihoito | Dogs, cats and most small pets. Care in the pet's own home (24h care = present the whole time, or by agreement), or 1–2 cats / one max medium-size dog at Minna's home. Only one household's pets at a time. Long and short bookings. Written care agreement always. Free introductory visit within HSL zones A–C. Medication and routine care procedures. Photo/video updates to the owner. Light tidying during the stay included. Liability insurance in force. |
| `cleaning` | Kodinhoitopalvelut | Basic and upkeep cleaning: kitchen surfaces, vacuuming and dusting, floor washing, bathroom and WC, window washing. Mainly with the client's own equipment; biodegradable disinfectant can be brought by agreement. Own work clothing and protective gear. Can be combined with a pet booking or bought standalone. |
| `garden` | Puutarhanhoito | Lawn mowing and trimming, planting/pruning/general upkeep, raking, snow work, small landscaping jobs. Client's own tools. Hourly or per-job pricing. |

### Pricing (verbatim figures — do not invent or round)

**Lemmikin hoito:** 18 € / h · 38 € day care under 8 h · 43 € per day for 1–3 days · 40 € per day for 4–6 days · 37 € per day for 7–10 days · 34 € per day beyond 10 days. Additional pets from the same household +25 %.

**Kodin siivous ja puutarhanhoito:** basic/upkeep cleaning 55 € / max 2.5 h · move-out cleaning 33 €/h · garden work priced per job.

**Terms:** first introductory visit free in the capital region · cancellation fee 50 % if cancelled less than 24 h before the booking starts · household tax deduction (kotitalousvähennys) available for the cleaning and garden work — 35 % in 2026 with a 150 € deductible; link to `vero.fi` · liability insurance in force.

**Included in pet care prices:** individual feeding and water changes (bowl washing, feeding area tidied), play and grooming to the pet's liking, individual walks, litter tray cleaning and the area around it, photo/video updates to the owner, small household tasks during the stay.

**What the owner brings:** the pet's own food and treats, own bed/blanket, own toy and brush, lead and collar/harness, cat's own litter tray and litter (a tray can be provided by agreement).

### Contact details

Email `minna.petsitter@gmail.com` · phone — **⚠️ the source site prints two different numbers (`045 783 14323` and `+358 45 78314323`); flag this to the client and use one canonical E.164 value** · WhatsApp available · Y-tunnus 3481889-8 · Facebook: `https://www.facebook.com/people/Minna-hoitaa/61583514297558/`.

### Testimonials

Three short customer quotes exist on the source site, attributed to Kristiina, Ulla and Merja (praise for the dogs staying happy in the heat, a spotless home, cats medicated correctly, and the photo updates). Copy them verbatim from the live pages, keep the attribution to first name only, and mark them up as `<blockquote><p>…</p><footer><cite>…</cite></footer></blockquote>`.

### Images

Source images live on the Webador CDN (`primary.jwwb.nl`). **Never hotlink them.** Download, then either (a) upload to the EmDash media library so the client can swap them, or (b) commit to `src/assets/` and serve through Astro's `<Image>`/`<Picture>` component. Note that some are licensed stock (the `pexels/` paths) and some are the client's own photos — list which is which in `docs/media-credits.md` and ask the client before publishing personal pet photos. Where a good photo doesn't exist, use a CSS/SVG-generated visual rather than a grey box.

---

## 2. Design direction

Ground everything in the actual subject: a person who lets herself into your home while you're away and leaves it — and your animal — better than she found it. The emotional promise is **"someone is home."** Design to that, not to "pet care website."

### Tokens (define once in `src/styles/abstracts/_tokens.scss`, use nowhere else as literals)

**Colour** — a Nordic winter-dusk palette, deliberately not the cream/serif/terracotta look:

| Token | Hex | Role |
|---|---|---|
| `--c-spruce-900` | `#12241F` | Ink, footer, dark sections |
| `--c-spruce-600` | `#2E5348` | Headings, primary button |
| `--c-sage-300` | `#A8BCAE` | Borders, muted UI, icon strokes |
| `--c-frost-050` | `#EDF0EA` | Page surface (cool, not cream) |
| `--c-lamp-500` | `#E8A33D` | **Signature accent** — warm window light. CTAs, focus rings, hover glow |
| `--c-rowan-600` | `#B0392A` | Sparingly: errors, one emphasis moment |

Contrast: `spruce-600` on `frost-050` and white on `spruce-900` both clear 4.5:1. `lamp-500` is a *background/graphic* colour — never set body text in it, and use `spruce-900` text on lamp-coloured buttons.

**Type** — pair a characterful display face with a deliberately legible body face. The body face choice is itself part of the brief (this is a trust service; legibility is brand):

- Display: **Bricolage Grotesque** (variable — use width and optical size, not just weight)
- Body/UI: **Atkinson Hyperlegible Next**
- Self-host via `@fontsource-variable/*`, `font-display: swap`, `latin` + `latin-ext` subsets, preload the display face only.
- Fluid scale with `clamp()`: `--fs-900` hero → `--fs-100` caption. Set `line-height` per step; do not let a global `1.5` ride on the hero.

**Layout** — one 12-column grid, `--container-max: 76rem`, gutters from a spacing scale (`--s-1` … `--s-12`, 4px base). Sections alternate surface / spruce-900 to structure the page without dividers.

**Signature element** — a CSS-only *lamp glow*: a soft radial-gradient warmth anchored behind the hero portrait and repeated at low opacity behind each service card icon on hover. Built entirely with `radial-gradient` and `filter: blur()`, no images, and it fades out under `prefers-reduced-motion`. This is the one bold move; keep everything else quiet.

**Icons** — draw three inline SVGs on one consistent system (24×24 viewBox, 1.5px stroke, round caps, `currentColor`): a paw, a cleaning cloth/spray silhouette, a leafed shoot. `aria-hidden="true"` and `focusable="false"` on all three; the accessible name always comes from adjacent text.

**Motion** — three moments only: a staggered hero reveal on load, a scroll-triggered fade-up on the service triptych, and the hover lamp glow. All 150–350 ms, `cubic-bezier(.2,.7,.3,1)`. Wrap every one in `@media (prefers-reduced-motion: no-preference)`.

**Before you build:** write your token table into `docs/design-tokens.md`, then re-read it once. If any part of it reads like the answer you'd give for any small-business site, change that part and note why.

---

## 3. Information architecture

| Route (fi) | Purpose | H1 |
|---|---|---|
| `/` | Positioning, three services, proof, about, CTA | Site's value proposition |
| `/palvelut/` | All three services in depth, one section each | Palvelut |
| `/palvelut/[slug]/` | Optional per-service detail (build only if content justifies it) | Service name |
| `/hinnasto/` | Full price table + terms + tax deduction note | Hinnasto |
| `/galleria/` | Photo grid | Kuvagalleria |
| `/ota-yhteytta/` | Form, phone, email, WhatsApp, business details | Ota yhteyttä |
| `/404` | Friendly, links home + contact | — |

English routes mirror these under `/en/…`. Keep Finnish slugs clean ASCII (`ota-yhteytta`, not `ota-yhteyttae`) and 301 the old Webador paths (`/hinnasto-2`, `/ota-yhteyttae`, `/kuvagalleria`) to the new ones.

**CTA rule (hard requirement):** every call to action on the site resolves to the contact page. Service cards, service sections, pricing blocks, the footer band, and the sticky mobile bar all point to `/ota-yhteytta/`. The only exceptions are the `tel:` and `mailto:` links and the WhatsApp deep link, which are direct-contact actions on the contact page itself. Centralise this — a single `CONTACT_PATH` constant resolved through `getRelativeLocaleUrl()` — so it cannot drift.

---

## 4. Content model in EmDash

Everything the client might reasonably want to change goes in the CMS. Nothing that is purely presentational does.

**Collections**

- `services` — `title`, `slug`, `summary`, `icon` (enum: `pets` | `cleaning` | `garden`), `body` (Portable Text), `bullets` (repeater), `image` (media ref), `order` (int, non-translatable)
- `testimonials` — `quote`, `author`, `service` (optional ref), `order`
- `price_groups` → `price_items` — `label`, `amount`, `unit`, `note`, `order`. Amounts are numbers, not strings; format in the template so a locale change doesn't break the price list.
- `pages` — for `hinnasto` terms text, the about section, and any prose the client edits
- `gallery_items` — `image`, `alt` (**required**, and enforce it in the schema), `caption`

**Site settings** — phone, email, WhatsApp number, Y-tunnus, Facebook URL, service area text. The footer and contact page read these; nothing is hardcoded.

**Menus** — one `primary` menu and one `footer` menu, per locale, fetched via `getMenu("primary", { locale: Astro.currentLocale })`.

**Seed** — put the whole content set in `.emdash/seed.json` so `pnpm seed` reproduces the site from scratch. Finnish entries first, then English entries referencing them via `translationOf`.

Rendering rule: templates read from EmDash and never hardcode editorial text. If a page needs a string the CMS doesn't own (a button label, a form error), it comes from the i18n dictionary — see §6.

---

## 5. Code architecture

```
src/
  components/          # one .astro file per block, PascalCase
    SiteHeader.astro   ServiceCard.astro    PriceTable.astro
    SiteFooter.astro   ServiceSection.astro TestimonialStrip.astro
    Button.astro       Hero.astro           ContactForm.astro
    SkipLink.astro     SectionHeading.astro GalleryGrid.astro
    LanguageSwitcher.astro  ServiceIcon.astro  ContactBand.astro
  layouts/
    BaseLayout.astro   # <html lang>, head, skip link, header, <main id="main">, footer
    PageLayout.astro   # BaseLayout + page header pattern
  pages/               # fi routes at root, en under /en/
  styles/
    abstracts/  _tokens.scss _mixins.scss _breakpoints.scss _functions.scss
    base/       _reset.scss _typography.scss _a11y.scss _forms.scss
    layout/     _l-container.scss _l-grid.scss _l-section.scss
    main.scss   # imports the above only — no component styles here
  i18n/         fi.json en.json ui.ts
  lib/          routes.ts (CONTACT_PATH etc.), format.ts (price/phone)
  assets/
```

**Styling rules — these are the ones that will be checked:**

1. **No inline CSS. No `style="…"` attributes anywhere.** Per-service theming is done with BEM modifiers (`service-card--pets`), not inline custom properties.
2. Global tokens, reset, typography and layout primitives live in `src/styles/`. Component styles live in that component's `<style lang="scss">` block (Astro scopes them — this is not inline CSS). Share abstracts by configuring `vite.css.preprocessorOptions.scss.additionalData` to auto-inject `@use "abstracts" as *;`.
3. **BEM everywhere**, including in the SCSS structure: `.service-card`, `.service-card__icon`, `.service-card__title`, `.service-card--pets`. One block per component file. Nesting max two levels; use `&__element` sparingly and never build class names with string concatenation that breaks find-in-project.
4. No `!important`. No utility-class soup. No Tailwind.
5. Beware specificity collisions between section-level and element-level selectors — a common source of cancelled-out padding. Keep section spacing owned by `_l-section.scss` alone.
6. JS: progressive enhancement only. The site must be fully readable and navigable with JS disabled. The only scripts are the mobile nav disclosure, the form's async submit, and the scroll-reveal observer — each a small module in the component's `<script>`, no framework, no global namespace. React ships only because EmDash's admin needs it; it must not appear on a public page.

---

## 6. Translation

Two separate systems, both required:

**Editorial content** → EmDash i18n. Configure Astro:

```js
i18n: {
  defaultLocale: "fi",
  locales: ["fi", "en"],
  fallback: { en: "fi" },
  routing: { prefixDefaultLocale: false },
}
```

EmDash reads this same block. Query with `{ locale: Astro.currentLocale }` everywhere.

**UI strings** → `src/i18n/fi.json` / `en.json` plus a typed `t()` helper in `src/i18n/ui.ts`:

```ts
export function useTranslations(locale: Locale) {
  return function t(key: keyof typeof fi): string { … };
}
```

Every user-visible string that is not CMS content goes through `t()` — nav labels, button text, form labels and validation messages, the skip link, `aria-label`s, the language switcher, 404 copy, image `alt` fallbacks, and `<title>`/meta descriptions. **Zero bare Finnish string literals in `.astro` templates.** Add a lint check or a grep step to the QA pass that catches them.

Also: `<html lang={Astro.currentLocale}>`, `hreflang` alternates in `<head>`, and a language switcher that links to the *same page* in the other locale (use `getTranslations()` for CMS-backed routes), not blindly to the homepage.

---

## 7. The contact page and form

The contact page is where every CTA lands, so it carries the most polish.

- Above the fold: phone (as a `tel:` link, tap-to-call on mobile), email, WhatsApp, response-time expectation, and service area.
- Form fields: Nimi (required), Sähköposti (required), Puhelin (optional), Palvelu (select — pet care / cleaning / garden / a combination), Viesti (required), plus a consent checkbox with a link to a privacy statement (GDPR — the client needs one; flag it).
- Handling: check whether the EmDash first-party **forms plugin** covers this (`@emdash-cms/plugin-forms` or equivalent — confirm the package name in the docs). If it does, use it so submissions land in the admin. If not, write an Astro API route that validates server-side and sends via a provider, and store nothing else.
- Spam: keep a honeypot field (the current site has one) marked `aria-hidden="true"` `tabindex="-1"` and hidden with a class, plus a submit-time check. No CAPTCHA.
- Accessibility: real `<label for>` on every field (never placeholder-as-label), `aria-describedby` for hints and errors, `aria-invalid` on failed fields, errors rendered inline *and* summarised at the top with focus moved to the summary, and an `aria-live="polite"` status region for the success message. **The form must work as a normal POST with JS disabled.**
- Success state: an actual "what happens next" message, not just "Kiitos."

---

## 8. Accessibility floor (non-negotiable)

- Skip link to `#main` (the source site has one — keep it, make it visible on focus).
- One `<h1>` per page, no heading levels skipped, landmarks: `<header>`, `<nav aria-label>`, `<main id="main">`, `<footer>`. Don't add redundant `role` attributes to elements that already carry the semantics — use ARIA only where HTML falls short (the mobile nav's `aria-expanded`/`aria-controls`, the form's live region, `aria-current="page"` on the active nav link).
- Visible `:focus-visible` ring in `--c-lamp-500` with a 2px offset, on every interactive element, never removed.
- Touch targets ≥ 44×44 px. Mobile nav operable by keyboard, closes on `Esc`, focus returns to the toggle.
- Contrast ≥ 4.5:1 for text, ≥ 3:1 for UI boundaries and graphic elements.
- Every content image has meaningful `alt` (enforced in the CMS schema); every decorative SVG is `aria-hidden`.
- `prefers-reduced-motion` respected for all three motion moments.
- Test with keyboard only, then with VoiceOver/NVDA, then run axe. Fix, don't annotate.

---

## 9. Build phases

Work in this order. Commit at each checkpoint.

**Phase 0 — Recon.** Read the EmDash docs index. Scaffold `npm create emdash@latest`. Get the admin running at `/_emdash/admin` on SQLite locally. Fetch and archive the four source pages plus the images into `content-source/` (gitignored). ✅ *Done when: `pnpm dev` serves a blank themed page and the admin loads.*

**Phase 1 — Foundations.** Tokens, reset, typography, layout primitives, `BaseLayout`, `SkipLink`, `Button`, i18n scaffolding with `t()`, routing constants. ✅ *Done when: an empty page renders with correct type scale at 320px / 768px / 1440px, keyboard focus is visible, and no string is hardcoded.*

**Phase 2 — Content model.** Define collections, site settings and menus in the EmDash admin; export to `.emdash/seed.json`; write the Finnish content; wire `getEmDashCollection` queries. ✅ *Done when: `pnpm seed` on a fresh DB reproduces all content and the client can edit a service description in the admin and see it live.*

**Phase 3 — Components.** Header (with mobile nav), footer, hero, `ServiceCard`, `ServiceSection`, `ServiceIcon`, `TestimonialStrip`, `PriceTable`, `ContactBand`, `GalleryGrid`, `LanguageSwitcher`. Build each in isolation against real content. ✅ *Done when: every repeating UI pattern exists exactly once in the codebase and BEM naming is consistent across markup and SCSS.*

**Phase 4 — Pages.** Compose all six routes. Add the 301 redirects. Meta titles/descriptions per page per locale, Open Graph image, `LocalBusiness` JSON-LD with the real address area, services and price range. ✅ *Done when: every page is complete, every CTA resolves to `/ota-yhteytta/`, and there are no dead links.*

**Phase 5 — Form.** Per §7. ✅ *Done when: a submission arrives, validation errors are announced to a screen reader, and the form still works with JS off.*

**Phase 6 — English locale.** Translate UI strings and seed the `en` content entries. ✅ *Done when: `/en/` is complete, `hreflang` is correct, and the switcher preserves the current page.*

**Phase 7 — Polish.** The three motion moments, hover and focus states, empty/error states, print stylesheet for the price list. Then take a screenshot of every page at three widths and critique your own work — remove one thing.

**Phase 8 — QA.** Below.

---

## 10. Definition of done

- [ ] `astro build` clean; no console errors or warnings on any route
- [ ] W3C validator passes on all six pages, both locales
- [ ] axe DevTools: zero violations; manual keyboard pass on every page; screen-reader pass on the form and nav
- [ ] Lighthouse mobile ≥ 95 on Performance, Accessibility, Best Practices, SEO
- [ ] Zero `style="` attributes in built HTML (grep the `dist/` output)
- [ ] Zero hardcoded user-visible strings outside `src/i18n/` and the CMS (grep for Finnish characters in `.astro` templates)
- [ ] No `!important` in the codebase
- [ ] Every CTA href resolves to the contact route for the active locale
- [ ] Layouts hold at 320px, 768px, 1024px, 1440px, and at 200% browser zoom
- [ ] Finnish diacritics render correctly in every font weight used
- [ ] Prices match §1 exactly
- [ ] `README.md` explains local setup, seeding, and how the client edits content; `docs/media-credits.md` lists image sources

---

## 11. Open questions to raise with the client

1. Which phone number is canonical?
2. Is a privacy statement available for the contact form's consent checkbox? (Required.)
3. Permission to reuse the personal pet photos, and which ones?
4. Is English actually wanted, or should the second locale wait?
5. Should the pricing PDF currently embedded on the Hinnasto page be carried over?
6. Preferred domain/hosting — Cloudflare Workers (EmDash's native target, D1 + R2) or a Node host?

---

## 12. Explicitly out of scope / do not do

No Tailwind. No inline styles. No `!important`. No `set:html` on CMS content. No lorem ipsum — every string is real content or a translation key. No stock-photo filler where a CSS visual would be better. No invented prices, testimonials or credentials. No client-side framework on public pages. No cookie banner unless analytics are actually added.
