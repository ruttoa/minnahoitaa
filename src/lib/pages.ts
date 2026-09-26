import { getEmDashEntry } from "emdash";
import { getRelativeLocaleUrl } from "astro:i18n";
import { defaultLocale, locales, type Locale } from "../i18n/ui";

/**
 * Looks up a published `pages` entry for the catch-all routes. Lives outside
 * GenericPage.astro because the route file itself must set the HTTP status:
 * `Astro.response.status` assigned inside a child component doesn't take
 * effect (the response head is already fixed by then), so a missing page
 * would render the 404 body with a 200 status.
 *
 * The admin's "view on site" link for a page is always `/{slug}` (the
 * collection's urlPattern) with no locale prefix. So on the default-locale
 * route, a slug that exists only in another locale (e.g. a page created in
 * English) returns `redirectTo` for that locale's URL instead of a 404.
 */
export async function getPageEntry(slug: string | undefined, locale: Locale) {
	if (!slug) return { entry: null, cacheHint: undefined, redirectTo: undefined };

	const found = await getEmDashEntry("pages", slug, { locale });
	if (found.entry || locale !== defaultLocale) return { ...found, redirectTo: undefined };

	for (const other of locales.filter((l) => l !== defaultLocale)) {
		const { entry } = await getEmDashEntry("pages", slug, { locale: other });
		if (entry) return { ...found, redirectTo: getRelativeLocaleUrl(other, `/${slug}`) };
	}
	return { ...found, redirectTo: undefined };
}
