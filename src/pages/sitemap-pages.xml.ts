// Sitemap for the `pages` collection. Replaces EmDash's generated one because
// that lists the homepage entry as /etusivu (a 301) instead of / and /en/.
// Same shape otherwise: one <url> per published, indexable entry with
// hreflang alternates (+ x-default) taken from the translation group.
import type { APIRoute } from "astro";
import { getHreflangAlternates } from "emdash";
import { listIndexablePages } from "../lib/page-index";
import { homepageHref } from "../lib/seo";
import { locales, type Locale } from "../i18n/ui";

export const prerender = false;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const GET: APIRoute = async ({ url }) => {
	const origin = url.origin;
	const rows: string[] = [];

	for (const locale of locales as readonly Locale[]) {
		for (const page of await listIndexablePages(locale, origin)) {
			const alternates = await getHreflangAlternates("pages", page.id, { siteUrl: origin });
			rows.push(
				[
					"  <url>",
					`    <loc>${esc(page.url)}</loc>`,
					`    <lastmod>${esc(page.updatedAt)}</lastmod>`,
					...alternates.map((a) => `    <xhtml:link rel="alternate" hreflang="${esc(a.hreflang)}" href="${esc(homepageHref(a.href))}" />`),
					"  </url>",
				].join("\n"),
			);
		}
	}

	const xml = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
		...rows,
		"</urlset>",
	].join("\n");
	return new Response(xml, {
		headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
	});
};
