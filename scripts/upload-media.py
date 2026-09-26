#!/usr/bin/env python3
"""Uploads the archived photos in content-source/images/ to the EmDash media
library and writes a filename -> media record map for scripts/populate-gallery.py.

Safe to re-run: photos already in the site's media library (matched by filename)
are reused, not uploaded again, and failed uploads are retried and reported. The
map is per site (content-source/media-upload-map.<site>.json), so a run against
production never overwrites the local one.

Usage:
    python3 scripts/upload-media.py                       # local dev server
    EMDASH_TOKEN=ec_pat_... python3 scripts/upload-media.py https://example.com

Local (http://localhost:4321) signs in via dev-bypass; any other base URL needs an
admin API token in EMDASH_TOKEN (Settings -> API tokens, scope media:write plus
media:read to reuse photos that are already uploaded).
"""

import http.cookiejar
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path

BASE_URL = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:4321").rstrip("/")
ROOT = Path(__file__).resolve().parent.parent
IMAGES_DIR = ROOT / "content-source" / "images"
SITE = re.sub(r"[^a-z0-9]+", "-", BASE_URL.lower()).strip("-")
MAP_FILE = ROOT / "content-source" / f"media-upload-map.{SITE}.json"

local = BASE_URL == "http://localhost:4321"
token = os.environ.get("EMDASH_TOKEN")
if not local and not token:
    sys.exit(f"Set EMDASH_TOKEN (admin API token) to run against {BASE_URL}")

opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
HEADERS = {
    "X-EmDash-Request": "1",
    "Origin": BASE_URL,
    # Cloudflare bot protection tends to 403 the default "Python-urllib" agent.
    "User-Agent": "minnahoitaa-setup-scripts/1.0",
}
if local:
    opener.open(f"{BASE_URL}/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin").read()
else:
    HEADERS["Authorization"] = f"Bearer {token}"


def request(method, path, data=None, content_type=None):
    headers = dict(HEADERS)
    if content_type:
        headers["Content-Type"] = content_type
    req = urllib.request.Request(f"{BASE_URL}{path}", data=data, headers=headers, method=method)
    with opener.open(req, timeout=120) as r:
        return json.load(r)["data"]


def describe(e):
    if isinstance(e, urllib.error.HTTPError):
        return f"HTTP {e.code}: {e.read().decode(errors='replace')[:300]}"
    return repr(e)


def library():
    """filename -> media record for everything already in the library."""
    out, cursor = {}, None
    while True:
        path = "/_emdash/api/media?limit=100" + (f"&cursor={cursor}" if cursor else "")
        data = request("GET", path)
        for item in data["items"]:
            out.setdefault(item["filename"], item)
        cursor = data.get("nextCursor")
        if not cursor:
            return out


def upload(path):
    boundary = "----minnahoitaa" + str(int(time.time() * 1000))
    mime = "image/png" if path.suffix.lower() == ".png" else "image/jpeg"
    body = (
        f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{path.name}"\r\n'
        f"Content-Type: {mime}\r\n\r\n"
    ).encode() + path.read_bytes() + f"\r\n--{boundary}--\r\n".encode()
    data = request("POST", "/_emdash/api/media", body, f"multipart/form-data; boundary={boundary}")
    return data.get("item") or data


# Cloudflare error 1102 = the Worker ran out of CPU time decoding the photo (the
# server computes its blurhash/size on upload). Big portrait shots can hit that on
# a busy or free-plan Worker, so a failed upload is retried from a downscaled copy
# (longest side SMALL_SIDE px, macOS `sips`) -- gallery tiles are ~400 px anyway.
SMALL_SIDE = 1280
TMP = Path(tempfile.mkdtemp(prefix="minnahoitaa-media-"))


def downscaled(path):
    if not shutil.which("sips"):
        return None
    out = TMP / path.name
    try:
        subprocess.run(["sips", "-Z", str(SMALL_SIDE), str(path), "--out", str(out)],
                       check=True, capture_output=True)
    except subprocess.CalledProcessError:
        return None
    return out


files = sorted(p for p in IMAGES_DIR.iterdir() if p.suffix.lower() in (".jpg", ".jpeg", ".png"))
if not files:
    sys.exit(f"No images in {IMAGES_DIR}")

try:
    existing = library()
except Exception as e:  # noqa: BLE001 - report and stop: the run can't dedupe safely
    sys.exit(f"Could not list the media library: {describe(e)}")

records, failed = {}, []
for f in files:
    if f.name in existing:
        records[f.name] = existing[f.name]
        print(f"have {f.name}", file=sys.stderr)
        continue
    source = f
    for attempt in range(1, 4):
        try:
            records[f.name] = upload(source)
            print(f"ok   {f.name}" + (" (downscaled)" if source is not f else ""), file=sys.stderr)
            break
        except Exception as e:  # noqa: BLE001
            print(f"fail {f.name} (attempt {attempt}/3): {describe(e)}", file=sys.stderr)
            if attempt == 1 and source is f and "1102" in describe(e):
                small = downscaled(f)
                if small:
                    source = small
                    print(f"     retrying {f.name} from a {SMALL_SIDE}px copy", file=sys.stderr)
            time.sleep(2 * attempt)
    else:
        failed.append(f.name)

shutil.rmtree(TMP, ignore_errors=True)
MAP_FILE.write_text(json.dumps(records, indent=2, ensure_ascii=False) + "\n")
print(f"Wrote {MAP_FILE} ({len(records)}/{len(files)} photos)", file=sys.stderr)
if failed:
    sys.exit(f"{len(failed)} upload(s) failed: {', '.join(failed)} -- re-run to retry")
