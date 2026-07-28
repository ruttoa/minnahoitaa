#!/usr/bin/env bash
# Creates the contact forms (fi + en) via @emdash-cms/plugin-forms's admin API.
#
# Why this exists: forms are admin-configured, not part of seed/seed.json —
# the plugin has no seed-file integration. Run this once against a fresh
# database (e.g. after wiping .wrangler/state for local dev) to recreate the
# "yhteydenotto" (fi) and "contact" (en) forms. Safe to re-run: forms/create
# fails with a slug conflict if a form already exists (harmless).
#
# Usage: ./scripts/setup-contact-form.sh [base-url]
# Requires a running dev server already signed in via dev-bypass (local dev)
# or a real admin session cookie for a deployed environment.

set -euo pipefail

BASE_URL="${1:-http://localhost:4321}"
COOKIE_JAR="$(mktemp)"
trap 'rm -f "$COOKIE_JAR"' EXIT

if [[ "$BASE_URL" == "http://localhost:4321" ]]; then
	curl -s -c "$COOKIE_JAR" -o /dev/null \
		"$BASE_URL/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin"
else
	echo "Non-local base URL: supply a valid admin session cookie yourself" >&2
	echo "(edit this script or pass -b/--cookie-jar manually)." >&2
	exit 1
fi

for form in contact-form.json contact-form-en.json; do
	curl -s -b "$COOKIE_JAR" -X POST \
		-H "Content-Type: application/json" \
		-H "X-EmDash-Request: 1" \
		-H "Origin: $BASE_URL" \
		--data @"$(dirname "$0")/$form" \
		"$BASE_URL/_emdash/api/plugins/emdash-forms/forms/create"
	echo
done
