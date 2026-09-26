# Media credits

Source: downloaded from the old Webador site's CDN (`primary.jwwb.nl`) on 2026-07-28, archived at `content-source/images/` (gitignored, not committed). Never hotlinked in the new site.

**Status (2026-07-28): all 31 files uploaded to the EmDash media library** via `scripts/upload-media.py` (`POST /_emdash/api/media`) — confirmed present in `/_emdash/admin/media`. Publish permission for the personal client-pet photos was confirmed directly in this session (not re-derived from Minna in writing) — if that changes, pull the affected items from the media library and from any `gallery_items`/`services.image` they've been attached to. The mapping of filename → uploaded media `{id, url}` is at `content-source/media-upload-map.<site>.json` (also gitignored).

**Status (2026-07-31): 26 of the 31 uploaded files are now `image` blocks on the bilingual `galleria` page** (fi + en alt text) via `scripts/populate-gallery.py` (originally as `gallery_items` entries; that content type was later removed in favor of image blocks) — see [README.md](../README.md#reseeding-from-scratch) and the "Gallery curation notes" section below for the three exclusions beyond the licensed-stock/decorative-card photos.

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
| img_20251001_142657-high.jpg | Close-up of a dog's paws, not garden/landscaping work as an earlier note here guessed — corrected 2026-07-31 after actually viewing the file. |
| img-20240622-wa0000-high.jpg | |
| img_20250213_104552-high.jpg | |
| img_20250426_181355-standard.jpg | |
| img_20250426_181234-high.jpg | |
| img_20250125_174743-high.jpg | |
| img_20250419_052357-high-5yo08l.jpg | **Flagged**: shows a visible human face (a woman, likely Minna, selfie with a dog), not just a pet — more sensitive than the rest of this set. Included in the gallery per the broad "every image but stock + nalle + vanessa" instruction, but worth Minna's explicit sign-off given a real face is identifiable, separate from the general publish-consent question. |
| img_20260303_134245-standard.jpg | |
| img_20260318_164658-standard.jpg | A dog (Bedlington terrier) in a pink coat by a pond, not garden/landscaping work as an earlier note here guessed — corrected 2026-07-31 after actually viewing the file. |
| img_20260327_181147-standard.jpg | |
| img_20260321_213251-standard.jpg | |
| 20190802_171830-high.jpg | **Excluded from the gallery** (2026-07-31): exterior photo of a two-story house with a balcony, palm tree, and flowering magnolia — doesn't depict pet care, cleaning, or garden work, and doesn't look like it's even in Finland (resembles New Zealand architecture). Likely an unrelated personal photo that ended up in this export by accident. Still uploaded to the media library; add it to the gallery manually if that reading is wrong. |
| img_20251117_133041-high.jpg | Close-up of a bath/shower mixer tap — included as a "cleaning" gallery photo, though it's a generic fixture shot rather than an obvious before/after. |
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

All 31 are now in the EmDash media library (not `src/assets/`) — per PLAN.md §1 option (a), so Minna can swap or manage them herself via the admin. Where no good photo exists or is chosen for a placement (e.g. the hero portrait), keep using the CSS/SVG-generated visual rather than a grey box.

## Gallery curation notes (2026-07-31)

`scripts/populate-gallery.py` put 26 of the 31 uploaded files on the `galleria` page as `image` blocks (fi + en alt text), per the instruction "every image but the stock ones and nalle-high.jpg and vanessa-portrait-high.jpg." Three further exclusions beyond that literal instruction, made by judgment rather than asked for:

- **9462219.jpeg, 30176423.jpeg** — licensed stock, already excluded per the instruction.
- **nalle-high.jpg, vanessa-portrait-high.jpg** — decorative pet-profile cards, already excluded per the instruction.
- **20190802_171830-high.jpg** — excluded on top of the instruction: a house exterior with no connection to any of the three services. See the table row above.

Everything else — including **img_20250419_052357-high-5yo08l.jpg**, which shows a visible human face, and **img_20251117_133041-high.jpg**, a generic bathroom-fixture close-up — was included as instructed. Both are flagged in the table above for a second look. `services.image` is still unset for all three services; that's a separate curation step.
