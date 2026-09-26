#!/usr/bin/env bash
# Creates the contact forms (fi + en) via @emdash-cms/plugin-forms's admin API.
#
# Why this exists: forms are admin-configured, not part of seed/seed.json —
# the plugin has no seed-file integration. Run this once against a fresh
# database (e.g. after wiping .wrangler/state for local dev) to recreate the
# "yhteydenotto" (fi) and "contact" (en) forms. Safe to re-run: forms/create
# fails with a slug conflict if a form already exists (harmless).
#
# Usage:
#   ./scripts/setup-contact-form.sh                      # local dev server
#   EMDASH_TOKEN=ec_pat_... ./scripts/setup-contact-form.sh https://example.com
# Local (http://localhost:4321) signs in via dev-bypass. Any other base URL needs
# an API token in EMDASH_TOKEN: create one in the admin (Settings -> API tokens)
# with the `admin` scope -- plugin routes require it.

set -euo pipefail

BASE_URL="${1:-http://localhost:4321}"
COOKIE_JAR="$(mktemp)"
trap 'rm -f "$COOKIE_JAR"' EXIT

AUTH=()
if [[ "$BASE_URL" == "http://localhost:4321" ]]; then
	curl -s -c "$COOKIE_JAR" -o /dev/null \
		"$BASE_URL/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin"
	AUTH=(-b "$COOKIE_JAR")
else
	: "${EMDASH_TOKEN:?Set EMDASH_TOKEN (admin API token) to run against $BASE_URL}"
	AUTH=(-H "Authorization: Bearer $EMDASH_TOKEN")
fi

for form in contact-form.json contact-form-en.json; do
	curl -s "${AUTH[@]}" -X POST \
		-H "Content-Type: application/json" \
		-H "X-EmDash-Request: 1" \
		-H "Origin: $BASE_URL" \
		--data @"$(dirname "$0")/$form" \
		"$BASE_URL/_emdash/api/plugins/emdash-forms/forms/create"
	echo
done
