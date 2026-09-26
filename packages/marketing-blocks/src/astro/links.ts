// Link handling shared by the blocks that take editor-typed URLs (Hero CTAs,
// Features card links, Pricing CTAs).
//
// - Only safe destinations are rendered: site-relative paths, #fragments,
//   ?queries and http(s)/mailto/tel URLs. Anything else (`javascript:`,
//   `data:`, `vbscript:`, protocol-relative `//host`) resolves to undefined so
//   the caller can drop the link instead of emitting a script-bearing href.
// - `@contact` is a keyword for the contact page: it resolves through the
//   site's CONTACT_PATH constant in the page's own locale, so CTAs never
//   hardcode "/ota-yhteytta/" (see CLAUDE.md: every CTA resolves to CONTACT_PATH).
import { getRelativeLocaleUrl } from "astro:i18n";
import { CONTACT_PATH } from "../../../../src/lib/routes";
import { defaultLocale, isLocale } from "../../../../src/i18n/ui";

export const CONTACT_LINK = "@contact";

const SAFE_SCHEME = /^(https?:|mailto:|tel:)/i;

export function resolveHref(url: string | undefined, currentLocale: string | undefined): string | undefined {
	const value = url?.trim();
	if (!value) return undefined;
	if (value === CONTACT_LINK) {
		return getRelativeLocaleUrl(isLocale(currentLocale) ? currentLocale : defaultLocale, CONTACT_PATH);
	}
	if (value.startsWith("#") || value.startsWith("?")) return value;
	if (value.startsWith("/")) return value.startsWith("//") ? undefined : value;
	return SAFE_SCHEME.test(value) ? value : undefined;
}
