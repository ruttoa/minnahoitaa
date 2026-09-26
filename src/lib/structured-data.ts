import { businessId, HOME_SLUG, pagePath, SERVICE_AREA_CITIES, SERVICES_SLUG } from "./seo";

type Block = { _type?: string } & Record<string, unknown>;
type Span = { text?: string; marks?: string[] };

const cities = SERVICE_AREA_CITIES.map((name) => ({ "@type": "City", name }));

const spansText = (children: unknown): string =>
	((children as Span[] | undefined) ?? []).map((c) => c.text ?? "").join("").replace(/ /g, " ").trim();

/** Offers from `table` blocks: a row whose price cell has bold "<number> €" / "€<number>" text (the site's price convention). */
function offersFromTables(blocks: Block[], business: string) {
	const offers: Record<string, unknown>[] = [];
	let section = "";
	for (const block of blocks) {
		if (block._type === "block" && block.style === "h2") section = spansText(block.children);
		if (block._type !== "table") continue;
		for (const row of (block.rows as Array<{ cells: Array<{ content?: Span[] }> }>) ?? []) {
			const [label, priceCell] = row.cells ?? [];
			const spans = priceCell?.content ?? [];
			const m = spansText(spans.filter((s) => s.marks?.includes("strong"))).match(/^(?:€\s*(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s*€)$/);
			if (!label || !m) continue;
			const price = Number((m[1] ?? m[2]).replace(",", "."));
			const rest = spansText(spans.filter((s) => !s.marks?.includes("strong"))).replace(/^\/\s*/, "");
			const name = [section, spansText(label.content)].filter(Boolean).join(": ");
			offers.push({
				"@type": "Offer",
				name,
				price,
				priceCurrency: "EUR",
				...(rest && { priceSpecification: { "@type": "UnitPriceSpecification", price, priceCurrency: "EUR", unitText: rest } }),
				seller: { "@id": business },
			});
		}
	}
	return offers;
}

interface Ctx {
	blocks: Block[];
	origin: URL | string;
	locale: string;
	slug: string;
	title: string;
	homeLabel: string;
}

/** Page-level JSON-LD nodes derived from an entry's blocks: breadcrumbs, FAQ, services, price offers. */
export function buildPageJsonLd({ blocks, origin, locale, slug, title, homeLabel }: Ctx): Record<string, unknown>[] {
	const nodes: Record<string, unknown>[] = [];
	const business = businessId(origin);
	const url = (path: string) => new URL(path, origin).toString();

	if (slug !== HOME_SLUG) {
		nodes.push({
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			itemListElement: [
				{ "@type": "ListItem", position: 1, name: homeLabel, item: url(pagePath(locale, HOME_SLUG)) },
				{ "@type": "ListItem", position: 2, name: title, item: url(pagePath(locale, slug)) },
			],
		});
	}

	const faq = blocks
		.filter((b) => b._type === "marketing.faq")
		.flatMap((b) => (b.items as Array<{ question?: string; answer?: string }> | undefined) ?? [])
		.filter((i) => i.question && i.answer);
	if (faq.length) {
		nodes.push({
			"@context": "https://schema.org",
			"@type": "FAQPage",
			mainEntity: faq.map((i) => ({
				"@type": "Question",
				name: i.question,
				acceptedAnswer: { "@type": "Answer", text: i.answer },
			})),
		});
	}

	if (slug === SERVICES_SLUG) {
		for (const b of blocks) {
			if (b._type !== "marketing.hero" || !b.anchor || !b.headline) continue;
			nodes.push({
				"@context": "https://schema.org",
				"@type": "Service",
				name: b.headline,
				serviceType: b.headline,
				...(b.subheadline && { description: String(b.subheadline).split(/\n\s*\n/)[0].replace(/\s+/g, " ").trim() }),
				url: `${url(pagePath(locale, slug))}#${String(b.anchor)}`,
				provider: { "@id": business },
				areaServed: cities,
			});
		}
	}

	const offers = offersFromTables(blocks, business);
	if (offers.length) {
		nodes.push({ "@context": "https://schema.org", "@type": "OfferCatalog", name: title, itemListElement: offers });
	}

	return nodes;
}
