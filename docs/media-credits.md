# Media credits

Source: downloaded from the old Webador site's CDN (`primary.jwwb.nl`) on 2026-07-28, archived at `content-source/images/` (gitignored, not committed). Never hotlinked in the new site.

**Status (2026-07-28): all 31 files uploaded to the EmDash media library** via `scripts/upload-media.sh` (`POST /_emdash/api/media`) — confirmed present in `/_emdash/admin/media`. Publish permission for the personal client-pet photos was confirmed directly in this session (not re-derived from Minna in writing) — if that changes, pull the affected items from the media library and from any `gallery_items`/`services.image` they've been attached to. The mapping of filename → uploaded media `{id, url}` is at `content-source/media-upload-map.json` (also gitignored).

## Client's own photos — personal photos of Minna's pet-care clients' pets

Filenames match phone-camera/WhatsApp export patterns (`imgYYYYMMDD_...`, `img-YYYYMMDD-waNNNN...`).

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
| img_20251001_142657-high.jpg | Garden path/landscaping work (stone paving) |
| img-20240622-wa0000-high.jpg | |
| img_20250213_104552-high.jpg | |
| img_20250426_181355-standard.jpg | |
| img_20250426_181234-high.jpg | |
| img_20250125_174743-high.jpg | |
| img_20250419_052357-high-5yo08l.jpg | |
| img_20260303_134245-standard.jpg | |
| img_20260318_164658-standard.jpg | Garden path/landscaping work (curved stone paving) |
| img_20260327_181147-standard.jpg | |
| img_20260321_213251-standard.jpg | |
| 20190802_171830-high.jpg | |
| img_20251117_133041-high.jpg | |
| 20181026_150654-high.jpg | |
| wp_20150803_001-high.jpg | Old filename pattern (Windows Phone camera) — likely predates the business, from Minna's time in New Zealand. Uploaded, but worth double-checking with Minna whether she actually wants a pre-toiminimi photo in the public gallery, separate from the publish-consent question. |
| wp_20150727_013-high.jpg | Same as above. |
| img-20251009-wa0005-high-6tbk37.jpg | |
| vanessa-portrait-high.jpg | **Resolved**: a decorative client-pet profile card — "Vanessa," a Bengal cat, ~2.5 years old. Not a person. |
| nalle-high.jpg | **Resolved**: a decorative client-pet profile card — "Nalle," a 6-year-old Samoyed-Husky mix dog. |

## Licensed stock (Pexels) — safe to reuse, attribution recommended

| File | Pexels ID | Subject | Photographer |
|---|---|---|---|
| 9462219.jpeg | [9462219](https://www.pexels.com/photo/9462219/) | Person cleaning a white wooden cabinet with a blue cloth | Liliana Drew |
| 30176423.jpeg | [30176423](https://www.pexels.com/photo/30176423/) | Unconfirmed — page returned 404 on lookup 2026-07-28 | Unconfirmed — re-check before publishing, or replace with a fresh Pexels image and record proper attribution |

Pexels license does not require attribution but crediting is good practice: https://www.pexels.com/license/

## Decision for the rebuild

All 31 are now in the EmDash media library (not `src/assets/`) — per PLAN.md §1 option (a), so Minna can swap or manage them herself via the admin. None are wired into `gallery_items` or `services.image` yet; that's a separate content-curation step (choosing which photos go where, writing per-photo alt text and captions) — ask if you want that done next. Where no good photo exists or is chosen for a placement (e.g. the hero portrait), keep using the CSS/SVG-generated visual rather than a grey box.
