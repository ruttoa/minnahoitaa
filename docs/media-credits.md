# Media credits

Source: downloaded from the old Webador site's CDN (`primary.jwwb.nl`) on 2026-07-28, archived at `content-source/images/` (gitignored, not committed). Never hotlinked in the new site.

## Client's own photos — ask permission before publishing

These are personal photos of Minna's clients' pets, filenames match phone-camera/WhatsApp export patterns (`imgYYYYMMDD_...`, `img-YYYYMMDD-waNNNN...`). **Do not publish until Minna confirms which pets/owners are OK to feature** (open question #3 in PLAN.md).

| File | Notes |
|---|---|
| img_20250709_200608-high.jpg | |
| img_20251009_123159-high.jpg | |
| img-20191022-wa0002-high.jpg | |
| img_20250918_093654-high.jpg | |
| img_20251009_123024-high.jpg | |
| img_20251225_094131-high.jpg | |
| img-20250307-wa0000-high.jpg | |
| img-20250217-wa0001-high.jpg | |
| img_20251229_115652-high.jpg | |
| img_20250611_142523-high.jpg | |
| img_20251001_142657-high.jpg | |
| img-20240622-wa0000-high.jpg | |
| img_20250213_104552-high.jpg | |
| img_20250426_181355-standard.jpg | |
| img_20250426_181234-high.jpg | |
| img_20250125_174743-high.jpg | |
| img_20250419_052357-high-5yo08l.jpg | |
| img_20260303_134245-standard.jpg | |
| img_20260318_164658-standard.jpg | |
| img_20260327_181147-standard.jpg | |
| img_20260321_213251-standard.jpg | |
| 20190802_171830-high.jpg | |
| img_20251117_133041-high.jpg | |
| 20181026_150654-high.jpg | |
| wp_20150803_001-high.jpg | Old filename pattern (Windows Phone camera) — likely predates the business, from Minna's time in New Zealand. Confirm before use. |
| wp_20150727_013-high.jpg | Same as above. |
| img-20251009-wa0005-high-6tbk37.jpg | |
| vanessa-portrait-high.jpg | Filename suggests a named person's portrait — unclear if this is Minna or someone else. **Ask the client who "Vanessa" is before using.** |
| nalle-high.jpg | "Nalle" (Finnish for "teddy bear") — likely a pet's name/nickname. Confirm subject and owner consent. |

## Licensed stock (Pexels) — safe to reuse, attribution recommended

| File | Pexels ID | Subject | Photographer |
|---|---|---|---|
| 9462219.jpeg | [9462219](https://www.pexels.com/photo/9462219/) | Person cleaning a white wooden cabinet with a blue cloth | Liliana Drew |
| 30176423.jpeg | [30176423](https://www.pexels.com/photo/30176423/) | Unconfirmed — page returned 404 on lookup 2026-07-28 | Unconfirmed — re-check before publishing, or replace with a fresh Pexels image and record proper attribution |

Pexels license does not require attribution but crediting is good practice: https://www.pexels.com/license/

## Decision for the rebuild

Per PLAN.md §1: either (a) upload the approved subset to the EmDash media library so Minna can swap them herself, or (b) commit selected, approved images to `src/assets/` and serve via Astro's `<Image>`/`<Picture>`. Where no good photo exists or permission isn't granted, use a CSS/SVG-generated visual instead of a grey box — this will likely apply to the hero portrait unless a specific photo is cleared for that placement.
