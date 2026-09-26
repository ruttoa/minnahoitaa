import { getEmDashCollection, getEmDashEntry } from "emdash";
import type { Locale } from "../i18n/ui";
import { pagePath } from "./seo";

export interface IndexedPage {
	/** Entry id (database ULID), for translation lookups. */
	id: string;
	slug: string;
	locale: Locale;
	/** Absolute canonical URL. */
	url: string;
	title: string;
	description: string | null;
	updatedAt: string;
}

/**
 * Published, indexable `pages` entries of one locale (own-locale entries only:
 * the en -> fi fallback would otherwise return untranslated fi pages too).
 * Shared by the sitemap and llms.txt. SEO data (noindex, canonical) is only
 * present on the single-entry query, so this does one lookup per entry.
 */
export async function listIndexablePages(locale: Locale, origin: string): Promise<IndexedPage[]> {
	const { entries } = await getEmDashCollection("pages", { locale });
	const pages: IndexedPage[] = [];
	for (const listed of entries) {
		if (listed.data.locale !== locale) continue;
		const { entry } = await getEmDashEntry("pages", listed.id, { locale });
		if (!entry || entry.data.seo?.noIndex) continue;
		const updated = entry.data.updatedAt as Date | string;
		pages.push({
			id: entry.data.id,
			slug: entry.id,
			locale,
			url: entry.data.seo?.canonical || new URL(pagePath(locale, entry.id), origin).toString(),
			title: entry.data.seo?.title || entry.data.title,
			description: entry.data.seo?.description || entry.data.intro || null,
			updatedAt: updated instanceof Date ? updated.toISOString() : String(updated),
		});
	}
	return pages;
}
