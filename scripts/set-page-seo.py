#!/usr/bin/env python3
"""Sets the SEO panel values (title, description) of the `pages` entries, fi + en,
and the site-wide default social-share image (og:image / twitter:image).

Why a script, not seed.json: the seed format has no per-entry SEO fields (they
live in EmDash's `_emdash_seo` table, written through the content API). Run it
after a fresh reseed; afterwards editors can change the values in each page's
"SEO" panel in the admin. Idempotent: overwrites title/description each time.

The <title> is "<title> — Minna hoitaa" (BaseLayout appends the site name), so
leave the name out of the titles below. The homepage title comes from the
`pages.homeTitle` i18n key, not from here.

The share image is content-source/og-image.jpg (1200x630, a crop of the homepage
hero photo; content-source/ is gitignored). It is uploaded to the media library
and set as `seo.defaultOgImage` -- skipped when the file is missing or a default
is already set. Needs media:write + settings:manage too (or the dev-bypass login).

Usage:
    python3 scripts/set-page-seo.py                       # local dev server
    EMDASH_TOKEN=ec_pat_... python3 scripts/set-page-seo.py https://example.com
Needs the content:write scope (token) or the local dev-bypass login.
"""

import http.cookiejar
import json
import os
import sys
import urllib.request
from pathlib import Path

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:4321"

# slug -> locale -> (title, description); keep descriptions under ~160 characters.
SEO = {
    "palvelut": {
        "fi": ("Lemmikinhoito, siivous ja puutarhanhoito Vantaalla",
               "Lemmikin hoito kotonasi tai luonani, kodin siivous sekä pihan ja puutarhan hoito Vantaalla ja pääkaupunkiseudulla. Maksuton tutustumiskäynti."),
        "en": ("Pet sitting, home cleaning and garden care in Vantaa",
               "Pet care at your home or mine, home cleaning, and garden maintenance in Vantaa and the Helsinki capital region. Free introductory visit."),
    },
    "hinnasto": {
        "fi": ("Hinnasto: lemmikinhoito ja siivous",
               "Lemmikin hoito 18 €/h, päivähoito 38 €/pv, perus- ja ylläpitosiivous 55 €. Koti- ja puutarhatyöt oikeuttavat kotitalousvähennykseen."),
        "en": ("Prices: pet sitting and home cleaning",
               "Pet care €18/h, day care €38/day, regular home cleaning €55. Home and garden work qualifies for the Finnish household tax deduction."),
    },
    "galleria": {
        "fi": ("Kuvagalleria: hoidokkeja ja töitä",
               "Kuvia hoitoon tulleista koirista, kissoista ja muista lemmikeistä sekä Minnan tekemistä koti- ja pihatöistä."),
        "en": ("Photo gallery: pets and work",
               "Photos of the dogs, cats and other pets Minna has cared for, and of her home and garden work."),
    },
    "ota-yhteytta": {
        "fi": ("Ota yhteyttä ja varaa maksuton tutustumiskäynti",
               "Kysy hoitoa lemmikillesi tai apua kotiin ja pihalle: yhteydenottolomake, puhelin tai WhatsApp. Palvelen Länsi-Vantaalla ja pääkaupunkiseudulla."),
        "en": ("Get in touch and book a free introductory visit",
               "Ask about pet care or help with your home and garden: contact form, phone or WhatsApp. Serving west Vantaa and the Helsinki capital region."),
    },
    "tietosuoja": {
        "fi": ("Tietosuojaseloste",
               "Miten Minna hoitaa käsittelee yhteydenottolomakkeen kautta ja asiakassuhteessa kerättyjä henkilötietoja."),
        "en": ("Privacy statement",
               "How Minna hoitaa handles personal data collected through the contact form and during the customer relationship."),
    },
}

jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
HEADERS = {"Content-Type": "application/json", "X-EmDash-Request": "1", "Origin": BASE_URL}
if BASE_URL == "http://localhost:4321":
    opener.open(f"{BASE_URL}/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin")
else:
    HEADERS["Authorization"] = f"Bearer {os.environ['EMDASH_TOKEN']}"


def call(method, path, body=None):
    req = urllib.request.Request(
        f"{BASE_URL}/_emdash/api{path}",
        data=json.dumps(body).encode() if body is not None else None,
        headers=HEADERS,
        method=method,
    )
    with opener.open(req) as r:
        return json.load(r)["data"]


for locale in ("fi", "en"):
    items = call("GET", f"/content/pages?locale={locale}&limit=100")["items"]
    by_slug = {i["slug"]: i for i in items}
    for slug, per_locale in SEO.items():
        item = by_slug.get(slug)
        if not item:
            print(f"skip {locale}/{slug}: no such page")
            continue
        title, description = per_locale[locale]
        call("PUT", f"/content/pages/{item['id']}", {"seo": {"title": title, "description": description}})
        print(f"ok   {locale}/{slug}")


# Default share image ---------------------------------------------------------
OG_IMAGE = Path(__file__).resolve().parent.parent / "content-source" / "og-image.jpg"
if not OG_IMAGE.exists():
    print("skip og image: content-source/og-image.jpg missing")
elif (call("GET", "/settings").get("seo") or {}).get("defaultOgImage"):
    print("skip og image: a default is already set")
else:
    boundary = "----ogimage"
    body = (
        f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="og-image.jpg"\r\n'
        "Content-Type: image/jpeg\r\n\r\n"
    ).encode() + OG_IMAGE.read_bytes() + f"\r\n--{boundary}--\r\n".encode()
    req = urllib.request.Request(
        f"{BASE_URL}/_emdash/api/media",
        data=body,
        headers={**HEADERS, "Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    with opener.open(req) as r:
        media = json.load(r)["data"]
    media_id = (media.get("item") or media)["id"]
    alt = "Kissa punotussa korissa"
    call("POST", "/settings", {"seo": {"defaultOgImage": {"mediaId": media_id, "alt": alt}}})
    print("ok   default og image")
