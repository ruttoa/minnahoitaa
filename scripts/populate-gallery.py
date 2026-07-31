#!/usr/bin/env python3
"""Creates gallery_items entries (fi + en) for the curated set of uploaded
client photos, via POST /_emdash/api/content/gallery_items + .../publish.

Why this exists: like scripts/setup-contact-form.sh and scripts/upload-media.sh,
gallery_items content isn't reproducible from seed/seed.json here because it
references media already uploaded to the library (see
content-source/media-upload-map.json, produced by upload-media.sh) rather than
re-downloading from an external URL the way seed.json's $media syntax does.

This is a one-time curation script, not idempotent — re-running it creates a
second set of duplicate entries. If you need to redo this after a reseed,
delete the existing gallery_items first (via the admin UI or the API) or don't
re-run this script.

Usage: python3 scripts/populate-gallery.py [base-url]
Requires content-source/media-upload-map.json to already exist (run
upload-media.sh first) and a running dev server.
"""

import json
import sys
import urllib.request
import http.cookiejar
from pathlib import Path

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:4321"
ROOT = Path(__file__).resolve().parent.parent
MAP_FILE = ROOT / "content-source" / "media-upload-map.json"
OUT_FILE = ROOT / "content-source" / "gallery-items-map.json"

# (filename, order, fi alt, en alt)
# Excludes: licensed stock photos (9462219.jpeg, 30176423.jpeg), the two
# decorative pet-profile cards (nalle-high.jpg, vanessa-portrait-high.jpg),
# and 20190802_171830-high.jpg (a house exterior photo that doesn't depict any
# of the three services -- see docs/media-credits.md).
ITEMS = [
    ("img_20251009_123159-high.jpg", 1,
     "Tiikerikissa istuu ulkotarhan tasolla ja katsoo ylös vehreää lehvästöä kohti.",
     "Tabby cat sitting on a platform in an outdoor cat enclosure, gazing up at green foliage."),
    ("img-20191022-wa0002-high.jpg", 2,
     "Pitkäkarvainen kissa valjaissa kävelyllä paksussa keltaisessa syyslehtikasassa.",
     "Long-haired cat in a walking harness among a thick carpet of yellow autumn leaves."),
    ("img_20250918_093654-high.jpg", 3,
     "Täplikäskuvioinen kissa makaa räsymatolla eteisessä ja katsoo kameraan.",
     "Spotted tabby cat lying on a woven rag rug in an entryway, looking at the camera."),
    ("img_20251009_123024-high.jpg", 4,
     "Tumma tiikerikissa istuu kaapin päällä ja katsoo ylös ikkunaa kohti.",
     "Dark tabby cat sitting on top of a cabinet, looking up toward a window."),
    ("img_20251225_094131-high.jpg", 5,
     "Pitkäkarvainen harmaa-valkoinen kissa lepää ikkunalaudalla värikkään kankaan vieressä, ulkona paljaat talvipuut.",
     "Long-haired grey-and-white cat resting on a windowsill next to colorful striped fabric, with bare winter trees outside."),
    ("img-20250307-wa0000-high.jpg", 6,
     "Kolmivärikissa makaa sohvan selkänojalla ja saa silitystä päähän.",
     "Calico cat lying on the back of a sofa, being petted on the head."),
    ("img-20250217-wa0001-high.jpg", 7,
     "Kaksi bengalikissaa sisätiloissa: toinen istuu tuolilla, toinen lepää käpertyneenä maton päällä.",
     "Two Bengal cats indoors: one perched on a chair, the other curled up on a rug below."),
    ("img_20251229_115652-high.jpg", 8,
     "Harmaa kissa istuu patterin kannella ikkunan edessä, viherkasvi vieressä ja paljaita koivuja näkymässä ulkona.",
     "Grey cat sitting on a radiator shelf by the window, a houseplant beside it and bare birch trees visible outside."),
    ("img_20260321_213251-standard.jpg", 9,
     "Kaksi kissaa köllöttää yhdessä tyynyllä tummalla sohvalla.",
     "Two cats curled up together on a cushion on a dark sofa."),
    ("img-20251009-wa0005-high-6tbk37.jpg", 10,
     "Kolmivärikissa köllöttää pyöreässä palmikoidussa korissa kuvioidulla nojatuolilla.",
     "Calico cat curled up in a round woven basket on a patterned armchair."),
    ("img_20250709_200608-high.jpg", 11,
     "Pörröinen suomenlapinkoira läähättää iltavalossa kalliolla, mäntymetsä taustalla.",
     "Fluffy Finnish Lapphund panting in the evening light on a rocky outcrop, pine forest behind."),
    ("img_20250611_142523-high.jpg", 12,
     "Pieni musta pitkäkarvainen koira, vihreä rusetti otsatukassa, seisoo polulla heinikon vieressä.",
     "Small black long-coated dog with a green bow in its fur, standing on a path beside tall grass."),
    ("img-20240622-wa0000-high.jpg", 13,
     "Musta koira nukkuu venyneenä kuvioidulla huovalla.",
     "Black dog sleeping stretched out on a patterned blanket."),
    ("img_20250213_104552-high.jpg", 14,
     "Harmaa-musta-valkoinen huskytyyppinen koira istuu lumessa ja katsoo ylös kameraan.",
     "Grey, black, and white husky-type dog sitting in the snow, looking up at the camera."),
    ("img_20250426_181355-standard.jpg", 15,
     "Läheiskuva harmaasta pörröturkkisesta terrieristä pehmolelun vieressä.",
     "Close-up of a grey shaggy-coated terrier next to a plush toy."),
    ("img_20250426_181234-high.jpg", 16,
     "Harmaa-valkoinen pörröturkkinen terrieri seisoo kalliolla mäntymetsässä aurinkoisena päivänä.",
     "Grey-and-white shaggy terrier standing on rocks in a pine forest on a sunny day."),
    ("img_20250125_174743-high.jpg", 17,
     "Läheiskuva kiharasta ruskeasta villakoirasta, joka lepää omistajan sylissä.",
     "Close-up of a curly brown poodle-type dog resting across an owner's lap."),
    ("img_20260318_164658-standard.jpg", 18,
     "Valkoinen bedlingtoninterrieri pinkissä takissa seisoo hihnassa lammikon lähellä metsäpolulla.",
     "White Bedlington terrier in a pink coat, standing on a leash near a pond on a forest path."),
    ("img_20260303_134245-standard.jpg", 19,
     "Kaksi jackrusselinterrieriä katsoo ylös kameraan lumisella polulla, toisella oranssi valjas.",
     "Two Jack Russell Terriers looking up at the camera on a snowy path, one wearing an orange harness."),
    ("img_20260327_181147-standard.jpg", 20,
     "Musta labradorinnoutajatyyppinen koira seisoo metsäpolulla auringonlaskun valossa.",
     "Black Labrador-type dog standing on a forest path in the evening light."),
    ("img_20251001_142657-high.jpg", 21,
     "Läheiskuva mustan koiran tassuista koiran maatessa selällään huovalla.",
     "Close-up of a black dog's paws as it lies on its back on a blanket."),
    ("img_20250419_052357-high-5yo08l.jpg", 22,
     "Nainen ottaa selfien pörröisen suomenlapinkoiran kanssa ulkona, taustalla paljaita puita.",
     "A woman takes a selfie with a fluffy Finnish Lapphund outdoors, bare trees in the background."),
    ("wp_20150727_013-high.jpg", 23,
     "Puutarhapolkua rakennetaan neliönmuotoisista laatoista pensasaidan ja raparperien vieressä.",
     "A garden path is being built from square paving stones alongside a hedge and rhubarb plants."),
    ("wp_20150803_001-high.jpg", 24,
     "Suora puutarhapolku laatoista rakenteilla, taustalla kottikärryt ja pinottuja laattoja.",
     "A straight garden path of paving stones under construction, with a wheelbarrow and stacked pavers nearby."),
    ("20181026_150654-high.jpg", 25,
     "Sorapolun reunaa kitketään rikkaruohoista kukkapenkin vierestä, vihreä ämpäri ja kitkentärauta esillä.",
     "Weeding along the edge of a gravel path next to a flower bed, with a green bucket and hand weeder in view."),
    ("img_20251117_133041-high.jpg", 26,
     "Läheiskuva kromisesta suihku- ja ammehanasta valkoisella laatoituksella.",
     "Close-up of a chrome bath and shower mixer tap on white tiling."),
]


def main():
    if BASE_URL != "http://localhost:4321":
        print("Non-local base URL: supply a valid admin session cookie yourself", file=sys.stderr)
        sys.exit(1)

    media = json.loads(MAP_FILE.read_text())

    jar = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
    opener.open(f"{BASE_URL}/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin").read()

    def api(method, path, body=None):
        data = json.dumps(body).encode("utf-8") if body is not None else None
        req = urllib.request.Request(f"{BASE_URL}{path}", data=data, method=method)
        req.add_header("X-EmDash-Request", "1")
        req.add_header("Origin", BASE_URL)
        if data is not None:
            req.add_header("Content-Type", "application/json")
        with opener.open(req) as resp:
            return json.loads(resp.read())

    results = {}
    for filename, order, alt_fi, alt_en in ITEMS:
        rec = media[filename]
        image_field = {
            "id": rec["id"],
            "src": rec["url"],
            "width": rec["width"],
            "height": rec["height"],
        }

        fi_body = {
            "locale": "fi",
            "data": {"image": image_field, "alt": alt_fi, "order": order},
        }
        fi_resp = api("POST", "/_emdash/api/content/gallery_items", fi_body)
        fi_item = fi_resp.get("data", {}).get("item", fi_resp.get("item", {}))
        fi_id = fi_item["id"]
        api("POST", f"/_emdash/api/content/gallery_items/{fi_id}/publish")

        en_body = {
            "locale": "en",
            "translationOf": fi_id,
            "data": {"image": image_field, "alt": alt_en, "order": order},
        }
        en_resp = api("POST", "/_emdash/api/content/gallery_items", en_body)
        en_item = en_resp.get("data", {}).get("item", en_resp.get("item", {}))
        en_id = en_item["id"]
        api("POST", f"/_emdash/api/content/gallery_items/{en_id}/publish")

        print(f"{filename}: fi={fi_id} en={en_id}", file=sys.stderr)
        results[filename] = {"fi": fi_id, "en": en_id, "order": order}

    OUT_FILE.write_text(json.dumps(results, indent=2, ensure_ascii=False))
    print(f"Wrote {OUT_FILE}", file=sys.stderr)


if __name__ == "__main__":
    main()
