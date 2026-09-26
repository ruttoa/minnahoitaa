import { getSiteSettings } from "emdash";
import { defaultLocale, useTranslations, type Locale } from "../i18n/ui";
import { getBusinessInfo } from "./business-info";
import { listIndexablePages } from "./page-index";
import { HOME_SLUG, pagePath } from "./seo";

/**
 * /llms.txt (fi) and /en/llms.txt: a plain-Markdown summary of the business and
 * its pages for LLM crawlers and assistants (llmstxt.org format). Built from the
 * same CMS data as the site, so it never drifts from the pages.
 */
export async function buildLlmsTxt(locals: object, locale: Locale, origin: string): Promise<string> {
	const t = useTranslations(locale);
	const settings = await getSiteSettings();
	const { entries } = await getBusinessInfo(locals, locale);
	const info = entries[0]?.data;
	// Homepage first, the privacy statement last, the rest in menu order.
	const order = [HOME_SLUG, "palvelut", "hinnasto", "galleria", "ota-yhteytta"];
	const rank = (slug: string) => (order.includes(slug) ? order.indexOf(slug) : order.length);
	const pages = (await listIndexablePages(locale, origin)).sort((a, b) => rank(a.slug) - rank(b.slug));

	const lines = [`# ${settings.title}`, "", `> ${t("meta.defaultDescription")}`, "", `## ${t("contact.detailsLabel")}`, ""];
	if (info) {
		lines.push(`- ${t("contact.phoneLabel")}: ${info.phone_display}`);
		lines.push(`- ${t("contact.emailLabel")}: ${info.email}`);
		lines.push(`- ${t("contact.serviceAreaLabel")}: ${info.service_area}`);
		if (info.price_range) lines.push(`- ${t("llms.priceLabel")}: ${info.price_range}`);
		lines.push(`- ${t("contact.businessIdLabel")}: ${info.business_id}`);
	}
	lines.push("", `## ${t("llms.pagesHeading")}`, "");
	for (const p of pages) {
		const title = p.slug === HOME_SLUG ? t("pages.homeTitle") : p.title;
		const description = p.slug === HOME_SLUG ? t("meta.defaultDescription") : p.description;
		lines.push(`- [${title}](${p.url})${description ? `: ${description}` : ""}`);
	}
	const other: Locale = locale === defaultLocale ? "en" : defaultLocale;
	lines.push(`- [${t("llms.otherLanguage")}](${new URL(`${pagePath(other, HOME_SLUG).replace(/\/$/, "")}/llms.txt`, origin)})`, "");
	return lines.join("\n");
}
