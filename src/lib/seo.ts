/** Slug of the `pages` entry that is served as the homepage (`/` and `/en/`). */
export const HOME_SLUG = "etusivu";

const HOME_PATH_RE = new RegExp(`^(/en)?/${HOME_SLUG}$`);

/**
 * Public path of a `pages` entry: the homepage entry lives at `/` (fi) and
 * `/en/`, every other page at `/{slug}` and `/en/{slug}` -- no trailing slash,
 * matching the sitemap and the nav links.
 */
export function pagePath(locale: string, slug: string): string {
	const prefix = locale === "fi" ? "" : `/${locale}`;
	if (slug === HOME_SLUG) return prefix ? `${prefix}/` : "/";
	return `${prefix}/${slug}`;
}

/** Canonical form of a request path: no trailing slash, except `/` and `/en/`. */
export function canonicalUrl(pathname: string, origin: URL | string): string {
	const path = pathname.replace(/\/+$/, "");
	const normalized = path === "" ? "/" : path === "/en" ? "/en/" : path;
	return new URL(normalized, origin).toString();
}

/** EmDash's helpers build the homepage entry's URL as `/etusivu`; map it to `/`. */
export function homepageHref(href: string): string {
	const url = new URL(href);
	const m = url.pathname.match(HOME_PATH_RE);
	if (m) url.pathname = m[1] ? "/en/" : "/";
	return url.toString();
}

/** The `pages` entry whose Hero blocks (those with an `anchor`) are the service list. */
export const SERVICES_SLUG = "palvelut";

/** The capital region, as schema.org `areaServed` (the business is based in Vantaa). */
export const SERVICE_AREA_CITIES = ["Vantaa", "Helsinki", "Espoo", "Kauniainen"] as const;

/** Stable JSON-LD node id of the business, shared by every page's structured data. */
export function businessId(origin: URL | string): string {
	return new URL("/#business", origin).toString();
}

/** JSON.stringify for an inline <script type="application/ld+json">: CMS text can't close the tag. */
export function ldJson(value: unknown): string {
	return JSON.stringify(value).replace(/</g, "\\u003c");
}
