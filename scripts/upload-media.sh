#!/usr/bin/env bash
# Uploads every image in content-source/images/ to the EmDash media library
# via POST /_emdash/api/media (multipart). Writes a filename -> {id, url}
# mapping to content-source/media-upload-map.json for later use (e.g.
# wiring specific uploads into gallery_items or services.image).
#
# Unlike scripts/setup-contact-form.sh, this isn't part of the reproducible
# seed pipeline: it depends on content-source/images/, which is gitignored
# and only exists on a machine that ran Phase 0's recon step. Re-run after
# a fresh reseed if you want the media library repopulated; already-uploaded
# files are deduplicated server-side by content hash, so re-running is safe.
#
# Usage: ./scripts/upload-media.sh [base-url]

set -euo pipefail

BASE_URL="${1:-http://localhost:4321}"
IMAGES_DIR="$(dirname "$0")/../content-source/images"
MAP_FILE="$(dirname "$0")/../content-source/media-upload-map.json"
COOKIE_JAR="$(mktemp)"
trap 'rm -f "$COOKIE_JAR"' EXIT

if [[ "$BASE_URL" == "http://localhost:4321" ]]; then
	curl -s -c "$COOKIE_JAR" -o /dev/null \
		"$BASE_URL/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin"
else
	echo "Non-local base URL: supply a valid admin session cookie yourself" >&2
	exit 1
fi

echo "{" > "$MAP_FILE"
first=1
for f in "$IMAGES_DIR"/*.jpg "$IMAGES_DIR"/*.jpeg; do
	[[ -e "$f" ]] || continue
	name="$(basename "$f")"
	response="$(curl -s -b "$COOKIE_JAR" -X POST \
		-H "X-EmDash-Request: 1" \
		-H "Origin: $BASE_URL" \
		-F "file=@${f}" \
		"$BASE_URL/_emdash/api/media")"
	echo "$name -> $(echo "$response" | grep -o '"id":"[^"]*"' | head -1)" >&2
	if [[ $first -eq 0 ]]; then echo "," >> "$MAP_FILE"; fi
	first=0
	printf '  "%s": %s' "$name" "$(echo "$response" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(json.dumps(d.get("data",{}).get("item",{})))')" >> "$MAP_FILE"
done
echo "" >> "$MAP_FILE"
echo "}" >> "$MAP_FILE"

echo "Wrote $MAP_FILE" >&2
